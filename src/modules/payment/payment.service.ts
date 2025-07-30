import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { createPayosPayment, verifyPayosWebhook } from './payment.util';
import PaymentSchema from './payment.model';
import AppointmentSchema from '../appointment/appointment.model';
import { AppointmentStatusEnum, PaymentStatusEnum as AppointmentPaymentStatusEnum, AppointmentPaymentStageEnum } from '../appointment/appointment.enum';
import { TransactionSchema } from '../transaction';
import { PaymentMethodEnum, PaymentStatusEnum, PaymentStageEnum } from './payment.enum';
import { CreatePayosPaymentDto } from './dtos/createPayosPayment.dto';
import { CreateWebhookDto } from './dtos/createWebhook.dto';
import { SampleService } from '../sample';
import { CreateAppointmentPaymentDto } from './dtos/createAppointmentPayment.dto';
import ServiceSchema from '../service/service.model';
import UserService from '../user/user.service';
import { sendMail, createNotificationEmailTemplate } from '../../core/utils';
import { ISendMailDetail } from '../../core/interfaces';
import { TransactionStatusEnum } from '../transaction/transaction.enum';
import { UserRoleEnum } from '../user/user.enum';
import { PaymentTypeEnum } from './payment.enum';

export default class PaymentService {
    private paymentSchema = PaymentSchema;
    private appointmentSchema = AppointmentSchema;
    private transactionSchema = TransactionSchema;
    private sampleService = new SampleService();
    private userService = new UserService();

    /**
     * Process PayOS Webhook - Enhanced for deposit/remaining flow
     */
    public async processPayosWebhook(data: CreateWebhookDto): Promise<{ success: boolean; message: string }> {
        try {
            console.log('PayOS Webhook received:', JSON.stringify(data, null, 2));

            if (!data.payment_no || !data.status) {
                console.error('PayOS Webhook: Missing required data (payment_no or status)');
                return { success: false, message: 'Invalid webhook data - missing required fields' };
            }

            const receivedSignature = data.signature || '';
            if (!receivedSignature) {
                console.error('PayOS Webhook: Missing signature');
                return { success: false, message: 'Missing webhook signature' };
            }

            const isValidSignature = verifyPayosWebhook(data, receivedSignature);
            if (!isValidSignature) {
                console.error('PayOS Webhook: Invalid signature received');
                return { success: false, message: 'Invalid webhook signature' };
            }

            console.log('PayOS Webhook: Signature verified successfully');

            const { payment_no, amount, status } = data;
            console.log(`Processing PayOS webhook for payment ${payment_no} with status ${status}`);

            // Find the payment
            const payment = await this.paymentSchema.findOne({
                $or: [{ payment_no: payment_no }, { payos_order_code: parseInt(payment_no) || 0 }],
            });

            if (!payment) {
                console.error(`PayOS Webhook: Payment not found: ${payment_no}`);
                return { success: false, message: 'Payment not found' };
            }

            // Verify amount if provided
            if (amount && payment.amount !== Number(amount)) {
                console.error(`PayOS Webhook: Amount mismatch. Expected: ${payment.amount}, Received: ${amount}`);
                return { success: false, message: 'Amount mismatch' };
            }

            // Update webhook received timestamp
            payment.payos_webhook_received_at = new Date();
            payment.updated_at = new Date();

            // Process based on status
            if (status === TransactionStatusEnum.SUCCESS || status === 'PAID') {
                console.log(`Payment ${payment_no} successful with stage ${payment.payment_stage}`);

                payment.payos_payment_status = TransactionStatusEnum.SUCCESS;
                payment.payos_payment_status_time = new Date();

                // Complete payment if not already completed
                let appointment: any = undefined;
                if (payment.status !== PaymentStatusEnum.COMPLETED) {
                    payment.status = PaymentStatusEnum.COMPLETED;

                    // Update appointment based on payment stage
                    appointment = await this.appointmentSchema.findById(payment.appointment_id);
                    if (appointment) {
                        await this.updateAppointmentAfterPayment(payment, appointment);
                    }
                }

                await payment.save();

                // Update transaction records
                await this.updateTransactionRecords(payment, TransactionStatusEnum.SUCCESS);

                // Send success email
                try {
                    if (!appointment) {
                        appointment = await this.appointmentSchema.findById(payment.appointment_id);
                    }
                    if (appointment) {
                        await this.sendPaymentSuccessEmail(payment, appointment);
                    }
                } catch (emailErr) {
                    console.error('Failed to send payment success email:', emailErr);
                }

                console.log(`Payment webhook ${payment_no} processed successfully - stage: ${payment.payment_stage}`);
                return { success: true, message: 'Payment webhook processed successfully' };
            } else if (status === TransactionStatusEnum.FAILED || status === 'CANCELLED') {
                console.log(`Payment ${payment_no} failed/cancelled with status ${status}`);

                payment.payos_payment_status = status;
                payment.payos_payment_status_time = new Date();
                await payment.save();

                // Update transaction records
                await this.updateTransactionRecords(payment, status);

                console.log(`Payment webhook ${payment_no} processed - failure status recorded`);
                return { success: true, message: 'Payment webhook processed - failure recorded' };
            } else {
                console.log(`Payment ${payment_no} webhook received with unknown status: ${status}`);

                payment.payos_payment_status = status;
                payment.payos_payment_status_time = new Date();
                await payment.save();

                return { success: true, message: `Webhook processed - status: ${status}` };
            }
        } catch (error) {
            console.error('PayOS Webhook processing error:', error);
            return { success: false, message: 'Internal webhook processing error' };
        }
    }

    /**
     * Create payment for appointment with DEPOSIT/REMAINING flow
     * @param userId ID of the user making the payment
     * @param paymentData Payment data including method and appointment ID
     * @returns Payment details including checkout URL if PAY_OS is selected
     */
    public async createAppointmentPayment(
        userId: string,
        paymentData: CreateAppointmentPaymentDto,
        userRole?: string,
    ): Promise<{
        payment_no: string;
        payment_method: string;
        status: string;
        amount: number;
        payment_stage: string;
        checkout_url?: string;
    }> {
        try {
            // Validate appointment
            const appointment = await this.appointmentSchema.findById(paymentData.appointment_id);
            if (!appointment) {
                throw new HttpException(HttpStatus.BadRequest, 'Appointment not found');
            }

            // Check if user has permission
            if (appointment.user_id && appointment.user_id.toString() !== userId) {
                // Allow staff to create payments regardless of appointment ownership
                if (userRole !== UserRoleEnum.STAFF && userRole !== UserRoleEnum.LABORATORY_TECHNICIAN) {
                    throw new HttpException(HttpStatus.Forbidden, 'You do not have permission to pay for this appointment');
                }
            }

            // Get service price from appointment
            const service = await ServiceSchema.findById(appointment.service_id);
            if (!service) {
                throw new HttpException(HttpStatus.BadRequest, 'Service not found for this appointment');
            }

            const totalAmount = appointment.total_amount || service.price;
            const depositAmount = appointment.deposit_amount || Math.round(totalAmount * 0.3);
            const amountPaidSoFar = appointment.amount_paid || 0;

            // Determine payment stage and amount
            let stage: PaymentStageEnum;
            let payAmount: number;
            let appointmentStage: AppointmentPaymentStageEnum;

            if (amountPaidSoFar === 0) {
                // First payment - deposit
                stage = PaymentStageEnum.DEPOSIT;
                payAmount = depositAmount;
                appointmentStage = AppointmentPaymentStageEnum.UNPAID;
            } else if (amountPaidSoFar >= depositAmount && amountPaidSoFar < totalAmount) {
                // Second payment - remaining amount
                stage = PaymentStageEnum.REMAINING;
                payAmount = totalAmount - amountPaidSoFar;
                appointmentStage = AppointmentPaymentStageEnum.DEPOSIT_PAID;
            } else if (amountPaidSoFar >= totalAmount) {
                throw new HttpException(HttpStatus.BadRequest, 'Appointment already fully paid');
            } else {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid payment state');
            }

            if (payAmount <= 0) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid payment amount');
            }

            // Check if there's already a pending payment for this stage
            const existingPayment = await this.paymentSchema.findOne({
                appointment_id: paymentData.appointment_id,
                payment_stage: stage,
                status: PaymentStatusEnum.PENDING,
            });

            if (existingPayment) {
                throw new HttpException(HttpStatus.BadRequest, `A pending ${stage} payment already exists for this appointment`);
            }

            const paymentNo = `PAY-${stage.toUpperCase()}-${uuidv4().substring(0, 8)}-${moment().format('HHmmss')}`;

            // Get samples for this appointment
            const samples = await this.sampleService.getSamplesByAppointmentId(paymentData.appointment_id);
            const sampleIds = samples.map((sample) => sample._id.toString());

            const payment = await this.paymentSchema.create({
                appointment_id: paymentData.appointment_id,
                sample_ids: sampleIds,
                amount: payAmount,
                payment_no: paymentNo,
                payment_method: paymentData.payment_method,
                status: PaymentStatusEnum.PENDING,
                payment_stage: stage,
                balance_origin: 0,
                created_at: new Date(),
                updated_at: new Date(),
            });

            // Send payment initiated email
            try {
                await this.sendPaymentInitiatedEmail(payment, appointment, userId);
            } catch (emailError) {
                console.error('Failed to send payment initiated email:', emailError);
            }

            // For CASH payment, immediately mark as completed
            if (paymentData.payment_method === PaymentMethodEnum.CASH) {
                await this.completeCashPayment(payment._id.toString(), appointment);
            }

            // Create transaction records
            await this.createTransactionRecords(payment, appointment);

            // Return result based on payment method
            const result = {
                payment_no: paymentNo,
                payment_method: paymentData.payment_method,
                status: paymentData.payment_method === PaymentMethodEnum.CASH ? PaymentStatusEnum.COMPLETED : PaymentStatusEnum.PENDING,
                amount: payAmount,
                payment_stage: stage,
            };

            // If PAY_OS, generate checkout URL
            if (paymentData.payment_method === PaymentMethodEnum.PAYOS) {
                const user = await this.userService.getUserById(userId);
                const description = `${stage === PaymentStageEnum.DEPOSIT ? 'Đặt cọc' : 'Thanh toán còn lại'} - ${paymentNo}`;

                const { checkoutUrl, orderCode } = await createPayosPayment(
                    payAmount,
                    paymentNo,
                    description,
                    `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                    user.email || '',
                    user.phone_number ? user.phone_number.toString() : '',
                );

                const payosWebId = checkoutUrl.split('/web/')[1];

                await this.paymentSchema.findByIdAndUpdate(
                    payment._id,
                    {
                        payos_payment_url: checkoutUrl,
                        payos_order_code: orderCode,
                        payos_web_id: payosWebId,
                    },
                    { new: true },
                );

                return {
                    ...result,
                    checkout_url: checkoutUrl,
                };
            }

            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating appointment payment');
        }
    }

    /**
     * Complete cash payment and update appointment
     */
    private async completeCashPayment(paymentId: string, appointment: any): Promise<void> {
        try {
            const payment = await this.paymentSchema.findByIdAndUpdate(
                paymentId,
                {
                    status: PaymentStatusEnum.COMPLETED,
                    updated_at: new Date(),
                },
                { new: true },
            );

            if (payment) {
                await this.updateAppointmentAfterPayment(payment, appointment);
                // Update transaction records to SUCCESS for cash payments
                await this.updateTransactionRecords(payment, TransactionStatusEnum.SUCCESS);
            }
        } catch (error) {
            console.error('Error completing cash payment:', error);
        }
    }

    /**
     * Update appointment status and amounts after successful payment
     */
    private async updateAppointmentAfterPayment(payment: any, appointment: any): Promise<void> {
        try {
            const newAmountPaid = (appointment.amount_paid || 0) + payment.amount;
            const totalAmount = appointment.total_amount || 0;

            let newPaymentStage: AppointmentPaymentStageEnum;
            let newPaymentStatus: any;

            if (payment.payment_stage === PaymentStageEnum.DEPOSIT) {
                // After deposit payment
                newPaymentStage = AppointmentPaymentStageEnum.DEPOSIT_PAID;
                newPaymentStatus = AppointmentPaymentStatusEnum.UNPAID; // Still unpaid until full payment
            } else if (payment.payment_stage === PaymentStageEnum.REMAINING) {
                // After remaining payment
                if (newAmountPaid >= totalAmount) {
                    newPaymentStage = AppointmentPaymentStageEnum.PAID;
                    newPaymentStatus = AppointmentPaymentStatusEnum.PAID;
                } else {
                    newPaymentStage = AppointmentPaymentStageEnum.DEPOSIT_PAID;
                    newPaymentStatus = AppointmentPaymentStatusEnum.UNPAID;
                }
            } else {
                return; // Unknown stage, don't update
            }

            await this.appointmentSchema.findByIdAndUpdate(appointment._id, {
                amount_paid: newAmountPaid,
                payment_stage: newPaymentStage,
                payment_status: newPaymentStatus,
                updated_at: new Date(),
            });

            console.log(`Appointment ${appointment._id} updated - Amount paid: ${newAmountPaid}, Stage: ${newPaymentStage}`);
        } catch (error) {
            console.error('Error updating appointment after payment:', error);
        }
    }

    /**
     * Verify payment status - Enhanced with deposit/remaining flow
     */
    public async verifyPaymentStatus(paymentIdentifier: string): Promise<{
        payment_status: string;
        appointment_id: string;
        paymentNo: string;
        payment_stage?: string;
        payos_status?: string;
        last_verified_at?: Date;
    }> {
        try {
            console.log(`Verifying payment status for: ${paymentIdentifier}`);

            // Try to find payment by payment_no first
            let payment = await this.paymentSchema.findOne({ payment_no: paymentIdentifier });

            // If not found, try by payos_order_code (number)
            if (!payment && /^\d+$/.test(paymentIdentifier)) {
                payment = await this.paymentSchema.findOne({ payos_order_code: parseInt(paymentIdentifier, 10) });
            }

            if (!payment) {
                throw new HttpException(HttpStatus.NotFound, 'Payment not found');
            }

            console.log(`Found payment: ${payment._id}, current status: ${payment.status}, stage: ${payment.payment_stage}, method: ${payment.payment_method}`);

            // For cash payments, just return current status
            if (payment.payment_method === PaymentMethodEnum.CASH) {
                console.log(`Cash payment - returning current status: ${payment.status}`);
                return {
                    paymentNo: payment.payment_no || paymentIdentifier,
                    payment_status: payment.status,
                    payment_stage: payment.payment_stage,
                    appointment_id: payment.appointment_id || '',
                    last_verified_at: new Date(),
                };
            }

            // For PayOS payments, check with PayOS API
            if (payment.payment_method === PaymentMethodEnum.PAYOS && payment.payos_order_code) {
                try {
                    console.log(`Checking PayOS status for order code: ${payment.payos_order_code}`);

                    // Check if PayOS is configured
                    const payosClientId = process.env.PAYOS_CLIENT_ID;
                    const payosApiKey = process.env.PAYOS_API_KEY;
                    const payosChecksumKey = process.env.PAYOS_CHECKSUM_KEY;

                    if (!payosClientId || !payosApiKey || !payosChecksumKey) {
                        console.warn('PayOS not configured - skipping payment verification');
                        return {
                            paymentNo: payment.payment_no || paymentIdentifier,
                            payment_status: payment.status,
                            payment_stage: payment.payment_stage,
                            appointment_id: payment.appointment_id || '',
                            payos_status: 'NOT_CONFIGURED',
                            last_verified_at: new Date(),
                        };
                    }

                    const PayOS = require('@payos/node');
                    const payosClient = new PayOS(payosClientId, payosApiKey, payosChecksumKey);

                    const payosResponse = await payosClient.getPaymentLinkInformation(payment.payos_order_code);
                    console.log(`PayOS API response:`, JSON.stringify(payosResponse, null, 2));

                    // Update payment with latest PayOS status
                    const updateData: any = {
                        payos_payment_status: payosResponse.status,
                        payos_payment_status_time: new Date(),
                        updated_at: new Date(),
                    };

                    if (payosResponse.transactions && payosResponse.transactions.length > 0) {
                        const transaction = payosResponse.transactions[0];
                        updateData.payos_payment_status_message = transaction.description;
                        updateData.payos_payment_status_code = transaction.counterAccountNumber;
                    }

                    await this.paymentSchema.findByIdAndUpdate(payment._id, updateData);

                    // If PayOS confirms payment and local status not completed, complete the payment
                    const payosStatusUpper = (payosResponse.status || '').toString().toUpperCase();
                    if ((payosStatusUpper === 'PAID' || payosStatusUpper === 'SUCCESS' || payosStatusUpper === 'COMPLETED') && payment.status !== PaymentStatusEnum.COMPLETED) {
                        // Mark payment as completed
                        await this.paymentSchema.findByIdAndUpdate(payment._id, {
                            status: PaymentStatusEnum.COMPLETED,
                            updated_at: new Date(),
                        });

                        payment.status = PaymentStatusEnum.COMPLETED;

                        // Update transaction records to SUCCESS
                        await this.updateTransactionRecords(payment, TransactionStatusEnum.SUCCESS);

                        // Update appointment based on payment stage
                        try {
                            const appointment = await this.appointmentSchema.findById(payment.appointment_id);
                            if (appointment) {
                                await this.updateAppointmentAfterPayment(payment, appointment);
                            }
                        } catch (appErr) {
                            console.error('Failed to update appointment after payment verification:', appErr);
                        }
                    }

                    return {
                        paymentNo: payment.payment_no || paymentIdentifier,
                        payment_status: payment.status,
                        payment_stage: payment.payment_stage,
                        appointment_id: payment.appointment_id || '',
                        payos_status: payosResponse.status,
                        last_verified_at: new Date(),
                    };
                } catch (payosError: any) {
                    console.error(`PayOS API error for payment ${paymentIdentifier}:`, payosError.message);

                    return {
                        paymentNo: payment.payment_no || paymentIdentifier,
                        payment_status: payment.status,
                        payment_stage: payment.payment_stage,
                        appointment_id: payment.appointment_id || '',
                        payos_status: 'API_ERROR',
                        last_verified_at: new Date(),
                    };
                }
            }

            // For other cases, return current status
            return {
                paymentNo: payment.payment_no || paymentIdentifier,
                payment_status: payment.status,
                payment_stage: payment.payment_stage,
                appointment_id: payment.appointment_id || '',
                last_verified_at: new Date(),
            };
        } catch (error) {
            console.error(`Error verifying payment ${paymentIdentifier}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error verifying payment status');
        }
    }

    /**
     * Cancel payment
     * @param paymentNo Payment number to cancel
     * @returns Cancelled payment status
     */
    public async cancelPayment(paymentNo: string): Promise<{
        success: boolean;
        message: string;
    }> {
        try {
            const payment = await this.paymentSchema.findOne({
                $or: [{ payment_no: paymentNo }, { order_code: paymentNo }],
                status: PaymentStatusEnum.PENDING,
            });

            if (!payment) {
                throw new HttpException(HttpStatus.NotFound, 'Pending payment not found');
            }

            // Update payment status to failed
            payment.status = PaymentStatusEnum.CANCELLED;
            payment.updated_at = new Date();
            await payment.save();

            // Update appointment payment status to failed
            const appointment = await this.appointmentSchema.findByIdAndUpdate(payment.appointment_id, { payment_status: AppointmentPaymentStatusEnum.FAILED }, { new: true });

            // Send payment cancelled email
            try {
                if (appointment) {
                    await this.sendPaymentCancelledEmail(payment, appointment);
                }
            } catch (emailError) {
                console.error('Failed to send payment cancelled email:', emailError);
            }

            return {
                success: true,
                message: 'Payment cancelled successfully',
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error cancelling payment');
        }
    }

    /**
     * Get samples for a payment
     * @param paymentId ID of the payment
     * @returns Array of samples associated with the payment
     */
    public async getPaymentSamples(paymentId: string): Promise<any[]> {
        try {
            const payment = await this.paymentSchema.findById(paymentId);
            if (!payment) {
                throw new HttpException(HttpStatus.NotFound, 'Payment not found');
            }

            if (!payment.sample_ids || payment.sample_ids.length === 0) {
                // If no sample IDs are stored in the payment, fetch all samples for the appointment
                return await this.sampleService.getSamplesByAppointmentId(payment.appointment_id || '');
            }

            // Fetch samples by their IDs
            const samples = [];
            for (const sampleId of payment.sample_ids) {
                try {
                    const sample = await this.sampleService.getSampleById(sampleId.toString());
                    samples.push(sample);
                } catch (error: any) {
                    console.error(`Error fetching sample ${sampleId}: ${error.message}`);
                    // Continue with the next sample
                }
            }

            return samples;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching samples for payment');
        }
    }

    public async findPaymentByOrderCode(orderCode: number) {
        return this.paymentSchema.findOne({ payos_order_code: orderCode });
    }

    /**
     * Send email notification for payment initiation
     */
    private async sendPaymentInitiatedEmail(payment: any, appointment: any, userId: string): Promise<void> {
        try {
            // Get user details
            const user = await this.userService.getUserById(userId);
            if (!user || !user.email) {
                console.error('Cannot send email: User not found or no email address');
                return;
            }

            // Get service details
            const service = await ServiceSchema.findById(appointment.service_id);
            if (!service) {
                console.error('Cannot send email: Service not found');
                return;
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

            // Determine payment stage message
            const isDeposit = payment.payment_stage === PaymentStageEnum.DEPOSIT;
            const stageText = isDeposit ? 'Đặt cọc' : 'Thanh toán còn lại';
            const title = `${stageText} - Payment Initiated`;

            let message = `
                Your ${isDeposit ? 'deposit' : 'remaining'} payment for ${service.name} has been initiated.
                <br><br>
                <strong>Payment Details:</strong>
                <br>
                Payment Number: ${payment.payment_no}
                <br>
                Payment Stage: ${stageText}
                <br>
                Amount: ${payment.amount.toLocaleString()} VND
                <br>
                Payment Method: ${payment.payment_method}
                <br><br>
            `;

            if (isDeposit) {
                message += `
                    <strong>Note:</strong> This is a deposit payment (30% of total service cost).
                    <br>
                    After successful deposit, you will need to pay the remaining amount to proceed with the service.
                    <br><br>
                `;
            } else {
                message += `
                    <strong>Note:</strong> This is the final payment to complete your service booking.
                    <br>
                    After successful payment, our team will proceed with your appointment.
                    <br><br>
                `;
            }

            // Add specific instructions based on payment method
            if (payment.payment_method === PaymentMethodEnum.PAYOS) {
                message += `
                    Please complete your payment by clicking on the checkout link that has been provided.
                    <br>
                    The payment link will expire in 15 minutes.
                `;
            } else if (payment.payment_method === PaymentMethodEnum.CASH) {
                message += `
                    Please prepare the exact amount for your appointment.
                    <br>
                    You will need to pay in cash when you arrive at our facility.
                `;
            }

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: `${stageText} Initiated - Bloodline DNA Testing Service`,
                html: createNotificationEmailTemplate(userName, title, message),
            };

            await sendMail(emailDetails);
            console.log(`Payment initiated email sent to ${user.email} for ${stageText.toLowerCase()}`);
        } catch (error) {
            console.error('Error sending payment initiated email:', error);
        }
    }

    /**
     * Send email notification for successful payment
     */
    private async sendPaymentSuccessEmail(payment: any, appointment: any): Promise<void> {
        try {
            // Get user details from appointment
            const userId = appointment.user_id;
            if (!userId) {
                console.error('Cannot send email: User ID not found in appointment');
                return;
            }

            const user = await this.userService.getUserById(userId.toString());
            if (!user || !user.email) {
                console.error('Cannot send email: User not found or no email address');
                return;
            }

            // Get service details
            const service = await ServiceSchema.findById(appointment.service_id);
            if (!service) {
                console.error('Cannot send email: Service not found');
                return;
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

            // Determine payment stage message
            const isDeposit = payment.payment_stage === PaymentStageEnum.DEPOSIT;
            const stageText = isDeposit ? 'Đặt cọc' : 'Thanh toán còn lại';
            const title = `${stageText} - Payment Successful`;

            let message = `
                Your ${isDeposit ? 'deposit' : 'remaining'} payment for ${service.name} has been successfully processed.
                <br><br>
                <strong>Payment Details:</strong>
                <br>
                Payment Number: ${payment.payment_no}
                <br>
                Payment Stage: ${stageText}
                <br>
                Amount: ${payment.amount.toLocaleString()} VND
                <br>
                Payment Method: ${payment.payment_method}
                <br>
                Payment Date: ${new Date().toLocaleString()}
                <br><br>
            `;

            if (isDeposit) {
                const totalAmount = appointment.total_amount || 0;
                const remainingAmount = totalAmount - (appointment.amount_paid || 0) - payment.amount;

                message += `
                    <strong>Next Steps:</strong>
                    <br>
                    Your deposit has been confirmed. To proceed with your DNA testing service,
                    you will need to pay the remaining amount of ${remainingAmount.toLocaleString()} VND.
                    <br><br>
                    You can make the remaining payment through the same system when you're ready to proceed.
                    <br><br>
                `;
            } else {
                message += `
                    <strong>Congratulations!</strong>
                    <br>
                    Your payment is now complete. Your appointment is fully confirmed and our team will proceed with the next steps.
                    <br><br>
                    You will receive further instructions about sample collection shortly.
                    <br><br>
                `;
            }

            message += `Thank you for choosing our services.`;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: `${stageText} Successful - Bloodline DNA Testing Service`,
                html: createNotificationEmailTemplate(userName, title, message),
            };

            await sendMail(emailDetails);
            console.log(`Payment success email sent to ${user.email} for ${stageText.toLowerCase()}`);
        } catch (error) {
            console.error('Error sending payment success email:', error);
        }
    }

    /**
     * Send email notification for failed payment
     */
    private async sendPaymentFailedEmail(payment: any, appointment: any): Promise<void> {
        try {
            // Get user details from appointment
            const userId = appointment.user_id;
            if (!userId) {
                console.error('Cannot send email: User ID not found in appointment');
                return;
            }

            const user = await this.userService.getUserById(userId.toString());
            if (!user || !user.email) {
                console.error('Cannot send email: User not found or no email address');
                return;
            }

            // Get service details
            const service = await ServiceSchema.findById(appointment.service_id);
            if (!service) {
                console.error('Cannot send email: Service not found');
                return;
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

            const title = 'Payment Failed';
            const message = `
                Your payment for ${service.name} could not be processed.
                <br><br>
                <strong>Payment Details:</strong>
                <br>
                Payment Number: ${payment.payment_no}
                <br>
                Amount: ${payment.amount.toLocaleString()} VND
                <br>
                Payment Method: ${payment.payment_method}
                <br><br>
                Please try again or contact our support team for assistance.
                <br><br>
                If you believe this is an error, please contact us immediately.
            `;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: 'Payment Failed - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(userName, title, message),
            };

            await sendMail(emailDetails);
            console.log(`Payment failed email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending payment failed email:', error);
        }
    }

    /**
     * Send email notification for cancelled payment
     */
    private async sendPaymentCancelledEmail(payment: any, appointment: any): Promise<void> {
        try {
            // Get user details from appointment
            const userId = appointment.user_id;
            if (!userId) {
                console.error('Cannot send email: User ID not found in appointment');
                return;
            }

            const user = await this.userService.getUserById(userId.toString());
            if (!user || !user.email) {
                console.error('Cannot send email: User not found or no email address');
                return;
            }

            // Get service details
            const service = await ServiceSchema.findById(appointment.service_id);
            if (!service) {
                console.error('Cannot send email: Service not found');
                return;
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

            const title = 'Payment Cancelled';
            const message = `
                Your payment for ${service.name} has been cancelled.
                <br><br>
                <strong>Payment Details:</strong>
                <br>
                Payment Number: ${payment.payment_no}
                <br>
                Amount: ${payment.amount.toLocaleString()} VND
                <br>
                Payment Method: ${payment.payment_method}
                <br><br>
                If you would like to proceed with your appointment, please make a new payment.
                <br><br>
                If you did not cancel this payment, please contact our support team immediately.
            `;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: 'Payment Cancelled - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(userName, title, message),
            };

            await sendMail(emailDetails);
            console.log(`Payment cancelled email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending payment cancelled email:', error);
        }
    }

    /**
     * Create payment for ADMINISTRATIVE appointment (government paid)
     */
    public async createAdministrativePayment(appointmentId: string, userId: string) {
        // Kiểm tra đã có payment chưa
        const existing = await this.paymentSchema.findOne({ appointment_id: appointmentId });
        if (existing) return existing;
        return this.paymentSchema.create({
            appointment_id: appointmentId,
            user_id: userId,
            amount: 0,
            payment_method: PaymentMethodEnum.GOVERNMENT,
            status: PaymentStatusEnum.COMPLETED,
            created_at: new Date(),
            updated_at: new Date(),
        });
    }

    /**
     * Create payment for result certificate request (2nd+ requests)
     */
    public async createCertificatePayment(
        certificateRequestId: string,
        customerId: string,
        amount: number = 100000, // Default 100k VND for certificate
    ): Promise<any> {
        try {
            // Generate payment number
            const paymentNo = `PAY-CERT-${uuidv4().substring(0, 8)}-${moment().format('HHmmss')}`;

            // Create payment record
            const paymentData = {
                payment_no: paymentNo,
                user_id: customerId,
                amount: amount,
                payment_method: PaymentMethodEnum.PAYOS,
                payment_type: PaymentTypeEnum.RESULT_CERTIFICATE,
                description: `Certificate request fee - Request ID: ${certificateRequestId}`,
                status: PaymentStatusEnum.PENDING,
                metadata: {
                    certificate_request_id: certificateRequestId,
                    fee_type: 'certificate_reissuance',
                },
            };

            const payment = await PaymentSchema.create(paymentData);

            // Create PayOS payment
            const payOSResponse = await createPayosPayment(
                amount,
                Math.floor(Date.now() / 1000).toString(),
                `Phí phát giấy kết quả lần 2+`,
                `Customer ${customerId}`,
                'customer@example.com', // Placeholder email, replace with actual customer email
                '0000000000', // Placeholder phone number, replace with actual customer phone number
            );

            // Update payment with PayOS details
            await PaymentSchema.findByIdAndUpdate(payment._id, {
                payos_order_code: payOSResponse.orderCode,
                payos_payment_url: payOSResponse.checkoutUrl,
                updated_at: new Date(),
            });

            return {
                payment_id: payment._id,
                payment_no: paymentNo,
                amount: amount,
                payos_order_code: payOSResponse.orderCode,
                checkout_url: payOSResponse.checkoutUrl,
                description: paymentData.description,
            };
        } catch (error) {
            console.error('Error creating certificate payment:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to create certificate payment');
        }
    }

    /**
     * Create transaction records for a payment
     */
    private async createTransactionRecords(payment: any, appointment: any): Promise<void> {
        try {
            console.log(`Creating transaction records for payment ${payment.payment_no}, payment_stage: ${payment.payment_stage}`);
            console.log(`Payment sample_ids:`, payment.sample_ids);
            console.log(`Appointment ID: ${appointment._id}`);

            // Check if we have sample_ids in the payment
            if (!payment.sample_ids || payment.sample_ids.length === 0) {
                console.log(`No sample_ids found in payment ${payment.payment_no}, creating appointment-level transaction record`);

                // Create a single transaction record for the appointment without specific sample
                const receiptNumber = `${payment.payment_no}-${payment.payment_stage.toUpperCase()}-${appointment._id.toString().substring(0, 6)}`;

                const transactionData = {
                    payment_id: payment._id,
                    customer_id: appointment.user_id,
                    sample_id: null, // No specific sample
                    receipt_number: receiptNumber,
                    payos_transaction_id: payment.payos_payment_id || null,
                    payos_payment_status: payment.payment_method === PaymentMethodEnum.CASH ? TransactionStatusEnum.SUCCESS : TransactionStatusEnum.PENDING,
                    transaction_date: new Date(),
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                console.log(`Creating appointment-level transaction with data:`, transactionData);

                const transaction = await this.transactionSchema.create(transactionData);
                console.log(`Successfully created appointment-level transaction:`, transaction._id);
                console.log(`Created 1 appointment-level transaction record for payment ${payment.payment_no} (${payment.payment_stage})`);
                return;
            }

            // Create transaction records for each sample
            console.log(`Creating ${payment.sample_ids.length} sample-specific transaction records`);

            const transactionPromises = payment.sample_ids.map(async (sampleId: string, index: number) => {
                const receiptNumber = `${payment.payment_no}-${payment.payment_stage.toUpperCase()}-${sampleId.toString().substring(0, 6)}`;

                const transactionData = {
                    payment_id: payment._id,
                    customer_id: appointment.user_id,
                    sample_id: sampleId,
                    receipt_number: receiptNumber,
                    payos_transaction_id: payment.payos_payment_id || null,
                    payos_payment_status: payment.payment_method === PaymentMethodEnum.CASH ? TransactionStatusEnum.SUCCESS : TransactionStatusEnum.PENDING,
                    transaction_date: new Date(),
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                console.log(`Creating sample transaction ${index + 1}/${payment.sample_ids.length} with data:`, transactionData);

                try {
                    const transaction = await this.transactionSchema.create(transactionData);
                    console.log(`Successfully created sample transaction ${index + 1}:`, transaction._id);
                    return transaction;
                } catch (sampleError) {
                    console.error(`Failed to create transaction for sample ${sampleId}:`, sampleError);
                    throw sampleError;
                }
            });

            const transactions = await Promise.all(transactionPromises);
            console.log(`Successfully created ${transactions.length} sample-specific transaction records for payment ${payment.payment_no} (${payment.payment_stage})`);
        } catch (error: any) {
            console.error(`Error creating transaction records for payment ${payment.payment_no}:`, error);
            console.error(`Error details:`, {
                message: error.message,
                stack: error.stack,
                payment_id: payment._id,
                payment_no: payment.payment_no,
                sample_ids: payment.sample_ids,
                appointment_id: appointment._id,
            });
            // Don't throw error to avoid breaking payment flow, but log it thoroughly
        }
    }

    /**
     * Update transaction records when payment status changes
     */
    private async updateTransactionRecords(payment: any, newStatus: string): Promise<void> {
        try {
            const updateData: any = {
                payos_payment_status: newStatus,
                payos_payment_status_time: new Date(),
                updated_at: new Date(),
            };

            if (newStatus === TransactionStatusEnum.SUCCESS) {
                updateData.payos_webhook_received_at = new Date();
            }

            const result = await this.transactionSchema.updateMany({ payment_id: payment._id }, updateData);

            console.log(`Updated ${result.modifiedCount} transaction records for payment ${payment.payment_no} to status ${newStatus}`);
        } catch (error) {
            console.error(`Error updating transaction records for payment ${payment.payment_no}:`, error);
        }
    }

    /**
     * Get transaction history for a payment
     */
    public async getPaymentTransactions(paymentId: string): Promise<any[]> {
        try {
            const transactions = await this.transactionSchema.find({ payment_id: paymentId }).populate('sample_id', 'sample_code sample_type').populate('customer_id', 'first_name last_name email').sort({ created_at: 1 });

            return transactions;
        } catch (error) {
            console.error(`Error fetching transactions for payment ${paymentId}:`, error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching payment transactions');
        }
    }

    /**
     * Get transaction history for an appointment
     */
    public async getAppointmentTransactions(appointmentId: string): Promise<any[]> {
        try {
            // First get all payments for this appointment
            const payments = await this.paymentSchema.find({ appointment_id: appointmentId });
            const paymentIds = payments.map((p) => p._id);

            // Then get all transactions for these payments
            const transactions = await this.transactionSchema
                .find({ payment_id: { $in: paymentIds } })
                .populate('payment_id', 'payment_no payment_stage amount payment_method status')
                .populate('sample_id', 'sample_code sample_type')
                .populate('customer_id', 'first_name last_name email')
                .sort({ created_at: 1 });

            return transactions;
        } catch (error) {
            console.error(`Error fetching transactions for appointment ${appointmentId}:`, error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching appointment transactions');
        }
    }

    /**
     * Test transaction creation
     */
    public async testTransactionCreation(): Promise<{ success: boolean; message: string; details?: any }> {
        try {
            // Create a test payment
            const testPayment = new this.paymentSchema({
                payment_no: `TEST-${Date.now()}`,
                appointment_id: 'test-appointment-id',
                customer_id: 'test-customer-id',
                amount: 100000,
                payment_method: PaymentMethodEnum.CASH,
                payment_type: PaymentTypeEnum.APPOINTMENT_DEPOSIT,
                status: PaymentStatusEnum.COMPLETED,
                payment_stage: PaymentStageEnum.DEPOSIT,
                created_at: new Date(),
                updated_at: new Date(),
            });

            await testPayment.save();

            // Create transaction records
            await this.createTransactionRecords(testPayment, { _id: 'test-appointment' });

            return {
                success: true,
                message: 'Test transaction created successfully',
                details: {
                    payment_id: testPayment._id,
                    payment_no: testPayment.payment_no,
                },
            };
        } catch (error) {
            console.error('Error creating test transaction:', error);
            return {
                success: false,
                message: 'Error creating test transaction',
                details: error,
            };
        }
    }

    /**
     * Search payment list with filters
     */
    public async searchPaymentList(searchParams: any): Promise<{
        payments: any[];
        pagination: {
            totalItems: number;
            totalPages: number;
            pageNum: number;
            pageSize: number;
        };
    }> {
        try {
            const {
                payment_no,
                appointment_id,
                user_id,
                staff_id,
                status,
                payment_method,
                payment_type,
                min_amount,
                max_amount,
                start_date,
                end_date,
                pageNum = 1,
                pageSize = 10,
                sort_by = 'created_at',
                sort_order = 'desc'
            } = searchParams;

            // Build query
            const query: any = {};

            if (payment_no) {
                query.payment_no = { $regex: payment_no, $options: 'i' };
            }

            if (appointment_id) {
                query.appointment_id = appointment_id;
            }

            // Handle user_id and staff_id through appointment lookup
            if (user_id || staff_id) {
                const appointmentQuery: any = {};
                if (user_id) appointmentQuery.user_id = user_id;
                if (staff_id) appointmentQuery.staff_id = staff_id;

                // Find appointments that match the criteria
                const matchingAppointments = await this.appointmentSchema.find(appointmentQuery).select('_id');
                const appointmentIds = matchingAppointments.map(app => app._id);

                if (appointmentIds.length > 0) {
                    query.appointment_id = { $in: appointmentIds };
                } else {
                    // If no appointments match, return empty result
                    return {
                        payments: [],
                        pagination: {
                            totalItems: 0,
                            totalPages: 0,
                            pageNum,
                            pageSize
                        }
                    };
                }
            }

            if (status) {
                query.status = status;
            }

            if (payment_method) {
                query.payment_method = payment_method;
            }

            if (payment_type) {
                query.payment_type = payment_type;
            }

            // Amount range
            if (min_amount || max_amount) {
                query.amount = {};
                if (min_amount) query.amount.$gte = min_amount;
                if (max_amount) query.amount.$lte = max_amount;
            }

            // Date range
            if (start_date || end_date) {
                query.created_at = {};
                if (start_date) query.created_at.$gte = new Date(start_date);
                if (end_date) query.created_at.$lte = new Date(end_date);
            }

            // Pagination
            const skip = (pageNum - 1) * pageSize;
            const sort: any = { [sort_by]: sort_order === 'desc' ? -1 : 1 };

            // Execute query
            const [payments, totalCount] = await Promise.all([
                this.paymentSchema.find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(pageSize)
                    .populate('appointment_id', 'appointment_date service_id type user_id staff_id')
                    .populate('parent_payment_id', 'payment_no amount status'),
                this.paymentSchema.countDocuments(query)
            ]);

            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                payments,
                pagination: {
                    totalItems: totalCount,
                    totalPages,
                    pageNum,
                    pageSize
                }
            };
        } catch (error) {
            console.error('Error searching payments:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error searching payments');
        }
    }

    /**
     * Get payment statistics
     */
    public async getPaymentStatistics(params: any): Promise<any> {
        try {
            const {
                startDate,
                endDate,
                status,
                payment_method,
                payment_type,
                days = 30
            } = params;

            // Build date filter
            let dateFilter: any = {};
            if (startDate || endDate) {
                dateFilter = {
                    created_at: {}
                };
                if (startDate) dateFilter.created_at.$gte = new Date(startDate);
                if (endDate) dateFilter.created_at.$lte = new Date(endDate);
            } else {
                // Default to last N days
                const defaultStartDate = new Date();
                defaultStartDate.setDate(defaultStartDate.getDate() - days);
                dateFilter = {
                    created_at: { $gte: defaultStartDate }
                };
            }

            // Build additional filters
            const additionalFilters: any = {};
            if (status) additionalFilters.status = status;
            if (payment_method) additionalFilters.payment_method = payment_method;
            if (payment_type) additionalFilters.payment_type = payment_type;

            const matchFilter = { ...dateFilter, ...additionalFilters };

            // Get total payments count
            const totalPayments = await this.paymentSchema.countDocuments(matchFilter);

            // Get total amount
            const totalAmountResult = await this.paymentSchema.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ]);
            const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

            // Get payments by status
            const paymentsByStatus = await this.paymentSchema.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get payments by method
            const paymentsByMethod = await this.paymentSchema.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: '$payment_method',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get payments by type
            const paymentsByType = await this.paymentSchema.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: '$payment_type',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get daily payment trends
            const dailyPayments = await this.paymentSchema.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$created_at'
                            }
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Get monthly payment trends
            const monthlyPayments = await this.paymentSchema.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m',
                                date: '$created_at'
                            }
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Get average payment amount
            const averageAmountResult = await this.paymentSchema.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: null,
                        averageAmount: { $avg: '$amount' }
                    }
                }
            ]);
            const averageAmount = averageAmountResult.length > 0 ? averageAmountResult[0].averageAmount : 0;

            // Get successful vs failed payments
            const successfulPayments = await this.paymentSchema.countDocuments({
                ...matchFilter,
                status: PaymentStatusEnum.COMPLETED
            });

            const failedPayments = await this.paymentSchema.countDocuments({
                ...matchFilter,
                status: { $in: [PaymentStatusEnum.FAILED, PaymentStatusEnum.CANCELLED] }
            });

            // Get recent payments (last 10)
            const recentPayments = await this.paymentSchema.find(matchFilter)
                .sort({ created_at: -1 })
                .limit(10)
                .populate('appointment_id', 'appointment_date service_id')
                .populate('sample_ids', 'type collection_method status');

            // Convert arrays to objects for easier frontend consumption
            const paymentsByStatusObj = paymentsByStatus.reduce((acc: any, item: any) => {
                acc[item._id] = {
                    count: item.count,
                    totalAmount: item.totalAmount
                };
                return acc;
            }, {});

            const paymentsByMethodObj = paymentsByMethod.reduce((acc: any, item: any) => {
                acc[item._id] = {
                    count: item.count,
                    totalAmount: item.totalAmount
                };
                return acc;
            }, {});

            const paymentsByTypeObj = paymentsByType.reduce((acc: any, item: any) => {
                acc[item._id] = {
                    count: item.count,
                    totalAmount: item.totalAmount
                };
                return acc;
            }, {});

            return {
                summary: {
                    totalPayments,
                    totalAmount,
                    averageAmount,
                    successfulPayments,
                    failedPayments,
                    successRate: totalPayments > 0 ? (successfulPayments / totalPayments * 100).toFixed(2) : 0,
                    dateRange: {
                        startDate: startDate || null,
                        endDate: endDate || null,
                        days
                    }
                },
                breakdowns: {
                    byStatus: paymentsByStatusObj,
                    byMethod: paymentsByMethodObj,
                    byType: paymentsByTypeObj
                },
                trends: {
                    daily: dailyPayments,
                    monthly: monthlyPayments
                },
                recentPayments
            };
        } catch (error) {
            console.error('Error fetching payment statistics:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching payment statistics');
        }
    }
}
