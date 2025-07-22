import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { createPayosPayment, verifyPayosWebhook } from './payment.util';
import PaymentSchema from './payment.model';
import AppointmentSchema from '../appointment/appointment.model';
import { AppointmentStatusEnum, PaymentStatusEnum as AppointmentPaymentStatusEnum } from '../appointment/appointment.enum';
import { TransactionSchema } from '../transaction';
import { PaymentMethodEnum, PaymentStatusEnum } from './payment.enum';
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

export default class PaymentService {
    private paymentSchema = PaymentSchema;
    private appointmentSchema = AppointmentSchema;
    private transactionSchema = TransactionSchema;
    private sampleService = new SampleService();
    private userService = new UserService();

    /**
     * Process PayOS Webhook - Fixed version with better error handling
     */
    public async processPayosWebhook(data: CreateWebhookDto): Promise<{ success: boolean; message: string }> {
        try {
            console.log('PayOS Webhook received:', JSON.stringify(data, null, 2));

            // Validate required webhook data
            if (!data.payment_no || !data.status) {
                console.error('PayOS Webhook: Missing required data (payment_no or status)');
                return { success: false, message: 'Invalid webhook data - missing required fields' };
            }

            // Verify webhook signature
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

            // Find the payment by payment_no or payos_order_code
            const payment = await this.paymentSchema.findOne({
                $or: [
                    { payment_no: payment_no },
                    { payos_order_code: parseInt(payment_no) || 0 }
                ]
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

            // Update payment with webhook received timestamp
            payment.payos_webhook_received_at = new Date();
            payment.updated_at = new Date();

            // Process based on status
            if (status === TransactionStatusEnum.SUCCESS || status === 'PAID') {
                console.log(`Payment ${payment_no} successful, recording webhook data`);

                // Update payment webhook data
                payment.payos_payment_status = TransactionStatusEnum.SUCCESS;
                payment.payos_payment_status_time = new Date();

                // NEW: Mark payment as completed if not already and update appointment status to PAID
                let appointment: any = undefined;
                if (payment.status !== PaymentStatusEnum.COMPLETED) {
                    payment.status = PaymentStatusEnum.COMPLETED;
                    appointment = await this.appointmentSchema.findByIdAndUpdate(
                        payment.appointment_id,
                        { payment_status: AppointmentPaymentStatusEnum.PAID },
                        { new: true }
                    );
                }

                await payment.save();

                // Send success email notification (only once)
                try {
                    if (!appointment) {
                        // Fetch appointment if we didn't update it above
                        appointment = await this.appointmentSchema.findById(payment.appointment_id);
                    }
                    if (appointment) {
                        await this.sendPaymentSuccessEmail(payment, appointment);
                    }
                } catch (emailErr) {
                    console.error('Failed to send payment success email:', emailErr);
                }

                // Create/update transactions for tracking (without changing payment status)
                if (payment.sample_ids && payment.sample_ids.length > 0) {
                    const transactionPromises = payment.sample_ids.map(async (sampleId) => {
                        return await this.transactionSchema.findOneAndUpdate(
                            {
                                payment_id: payment._id,
                                sample_id: sampleId
                            },
                            {
                                payment_id: payment._id,
                                receipt_number: `${payment_no}-${sampleId.toString().substring(0, 6)}`,
                                transaction_date: new Date(),
                                sample_id: sampleId,
                                payos_transaction_id: payment.payos_payment_id,
                                payos_payment_status: TransactionStatusEnum.SUCCESS,
                                payos_payment_status_time: new Date(),
                                payos_webhook_received_at: new Date(),
                                updated_at: new Date(),
                            },
                            {
                                upsert: true,
                                new: true,
                                setDefaultsOnInsert: true
                            }
                        );
                    });

                    try {
                        const transactions = await Promise.all(transactionPromises);
                        console.log(`Created/updated ${transactions.length} transactions for payment ${payment_no}`);
                    } catch (transactionError) {
                        console.error(`Error creating transactions for payment ${payment_no}:`, transactionError);
                    }
                }

                console.log(`Payment webhook ${payment_no} processed successfully - webhook data recorded`);
                return { success: true, message: 'Payment webhook processed successfully' };

            } else if (status === TransactionStatusEnum.FAILED || status === 'CANCELLED') {
                console.log(`Payment ${payment_no} failed/cancelled with status ${status}`);

                // Update payment webhook data (but not status as requested)
                payment.payos_payment_status = status;
                payment.payos_payment_status_time = new Date();
                await payment.save();

                // Update any existing transactions webhook data
                if (payment.sample_ids && payment.sample_ids.length > 0) {
                    await this.transactionSchema.updateMany(
                        { payment_id: payment._id },
                        {
                            payos_payment_status: status,
                            payos_payment_status_time: new Date(),
                            payos_webhook_received_at: new Date(),
                            updated_at: new Date(),
                        }
                    );
                }

                console.log(`Payment webhook ${payment_no} processed - failure status recorded`);
                return { success: true, message: 'Payment webhook processed - failure recorded' };

            } else {
                console.log(`Payment ${payment_no} webhook received with unknown status: ${status}`);

                // Still update webhook received time
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
     * Create payment for appointment with selected payment method
     * @param userId ID of the user making the payment
     * @param paymentData Payment data including method and appointment ID
     * @returns Payment details including checkout URL if PAY_OS is selected
     */
    public async createAppointmentPayment(userId: string, paymentData: CreateAppointmentPaymentDto, userRole?: string): Promise<{
        payment_no: string;
        payment_method: string;
        status: string;
        amount: number;
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

            // Check if payment already exists
            const existingPayment = await this.paymentSchema.findOne({
                appointment_id: paymentData.appointment_id,
                status: { $in: [PaymentStatusEnum.COMPLETED, PaymentStatusEnum.PENDING] }
            });

            if (existingPayment) {
                throw new HttpException(HttpStatus.BadRequest, 'Payment already exists for this appointment');
            }

            // Get service price from appointment
            const service = await ServiceSchema.findById(appointment.service_id);
            if (!service) {
                throw new HttpException(HttpStatus.BadRequest, 'Service not found for this appointment');
            }

            const amount = service.price;
            if (amount <= 0) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid payment amount');
            }

            const paymentNo = `PAY-${uuidv4().substring(0, 8)}-${moment().format('HHmmss')}`;

            // Tự động lấy tất cả các mẫu dữ liệu liên quan đến cuộc hẹn
            const samples = await this.sampleService.getSamplesByAppointmentId(paymentData.appointment_id);
            if (!samples || samples.length === 0) {
                console.log(`No samples found for appointment ${paymentData.appointment_id}`);
            } else {
                console.log(`Found ${samples.length} samples for appointment ${paymentData.appointment_id}`);
            }

            // Lưu danh sách ID mẫu
            const sampleIds = samples.map(sample => sample._id.toString());

            const payment = await this.paymentSchema.create({
                appointment_id: paymentData.appointment_id,
                sample_ids: sampleIds,
                amount: amount,
                payment_no: paymentNo,
                payment_method: paymentData.payment_method,
                status: PaymentStatusEnum.PENDING,
                balance_origin: 0,
                created_at: new Date(),
                updated_at: new Date(),
            });

            // Update appointment payment status
            await this.appointmentSchema.findByIdAndUpdate(
                paymentData.appointment_id,
                { payment_status: AppointmentPaymentStatusEnum.UNPAID },
                { new: true }
            );

            // Send payment initiated email
            try {
                await this.sendPaymentInitiatedEmail(payment, appointment, userId);
            } catch (emailError) {
                console.error('Failed to send payment initiated email:', emailError);
            }

            // Immediately verify payment for CASH (and mark as completed, update appointment, create transaction)
            if (paymentData.payment_method === PaymentMethodEnum.CASH) {
                await this.verifyPaymentStatus(paymentNo);
            }

            // Return result based on payment method
            const result = {
                payment_no: paymentNo,
                payment_method: paymentData.payment_method,
                status: PaymentStatusEnum.PENDING,
                amount: amount,
            };

            // If PAY_OS, generate checkout URL
            if (paymentData.payment_method === PaymentMethodEnum.PAY_OS) {
                // Get user information for payment
                const user = await this.userService.getUserById(userId);

                const description = `Thanh toán ${paymentNo}`;
                const { checkoutUrl, orderCode } = await createPayosPayment(
                    amount,
                    paymentNo,
                    description,
                    `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                    user.email || '',
                    user.phone_number ? user.phone_number.toString() : ''
                );

                const payosWebId = checkoutUrl.split('/web/')[1];

                await this.paymentSchema.findByIdAndUpdate(
                    payment._id,
                    {
                        payos_payment_url: checkoutUrl,
                        payment_no: paymentNo,
                        payos_order_code: orderCode,
                        payos_web_id: payosWebId
                    },
                    { new: true }
                );

                return {
                    ...result,
                    checkout_url: checkoutUrl
                };
            }

            // For CASH payment, no checkout URL is needed
            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating appointment payment');
        }
    }

    /**
     * Verify payment status - Fixed version with proper PayOS API integration
     */
    public async verifyPaymentStatus(paymentIdentifier: string): Promise<{
        payment_status: string;
        appointment_id: string;
        paymentNo: string;
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

            console.log(`Found payment: ${payment._id}, current status: ${payment.status}, method: ${payment.payment_method}`);

            // For cash payments, just return current status without changing anything
            if (payment.payment_method === PaymentMethodEnum.CASH) {
                console.log(`Cash payment - returning current status: ${payment.status}`);
                return {
                    paymentNo: payment.payment_no || paymentIdentifier,
                    payment_status: payment.status,
                    appointment_id: payment.appointment_id || '',
                    last_verified_at: new Date()
                };
            }

            // For PayOS payments, check with PayOS API if we have order code
            if (payment.payment_method === PaymentMethodEnum.PAY_OS && payment.payos_order_code) {
                try {
                    console.log(`Checking PayOS status for order code: ${payment.payos_order_code}`);

                    // Get PayOS client instance
                    const PayOS = require('@payos/node');
                    const payosClient = new PayOS(
                        process.env.PAYOS_CLIENT_ID,
                        process.env.PAYOS_API_KEY,
                        process.env.PAYOS_CHECKSUM_KEY
                    );

                    // Query PayOS for payment information
                    const payosResponse = await payosClient.getPaymentLinkInformation(payment.payos_order_code);
                    console.log(`PayOS API response:`, JSON.stringify(payosResponse, null, 2));

                    // Update payment with latest PayOS status (without changing main status)
                    const updateData: any = {
                        payos_payment_status: payosResponse.status,
                        payos_payment_status_time: new Date(),
                        updated_at: new Date()
                    };

                    // Add additional PayOS data if available
                    if (payosResponse.transactions && payosResponse.transactions.length > 0) {
                        const transaction = payosResponse.transactions[0];
                        updateData.payos_payment_status_message = transaction.description;
                        updateData.payos_payment_status_code = transaction.counterAccountNumber;
                    }

                    await this.paymentSchema.findByIdAndUpdate(payment._id, updateData);

                    console.log(`PayOS verification complete - PayOS status: ${payosResponse.status}, Local status: ${payment.status}`);

                    // If PayOS confirms payment (PAID/SUCCESS) and local status not completed, update both payment and appointment
                    const payosStatusUpper = (payosResponse.status || '').toString().toUpperCase();
                    if ((payosStatusUpper === 'PAID' || payosStatusUpper === 'SUCCESS' || payosStatusUpper === 'COMPLETED') && payment.status !== PaymentStatusEnum.COMPLETED) {
                        // Mark payment as completed in DB
                        await this.paymentSchema.findByIdAndUpdate(payment._id, {
                            status: PaymentStatusEnum.COMPLETED,
                            updated_at: new Date()
                        });

                        // Also update the local payment object to reflect the new status
                        payment.status = PaymentStatusEnum.COMPLETED;

                        // Mark appointment as paid
                        try {
                            await this.appointmentSchema.findByIdAndUpdate(
                                payment.appointment_id,
                                { payment_status: AppointmentPaymentStatusEnum.PAID },
                                { new: true }
                            );
                        } catch (appErr) {
                            console.error('Failed to update appointment payment_status to PAID:', appErr);
                        }
                    }

                    // Always return the **latest** local status after potential updates
                    return {
                        paymentNo: payment.payment_no || paymentIdentifier,
                        payment_status: payment.status,
                        appointment_id: payment.appointment_id || '',
                        payos_status: payosResponse.status,
                        last_verified_at: new Date()
                    };

                } catch (payosError: any) {
                    console.error(`PayOS API error for payment ${paymentIdentifier}:`, payosError.message);

                    // If PayOS API fails, return current local status
                    return {
                        paymentNo: payment.payment_no || paymentIdentifier,
                        payment_status: payment.status,
                        appointment_id: payment.appointment_id || '',
                        payos_status: 'API_ERROR',
                        last_verified_at: new Date()
                    };
                }
            }

            // For other payment methods or PayOS without order code, return current status
            console.log(`Returning current payment status: ${payment.status}`);
            return {
                paymentNo: payment.payment_no || paymentIdentifier,
                payment_status: payment.status,
                appointment_id: payment.appointment_id || '',
                last_verified_at: new Date()
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
                $or: [
                    { payment_no: paymentNo },
                    { order_code: paymentNo }
                ],
                status: PaymentStatusEnum.PENDING
            });

            if (!payment) {
                throw new HttpException(HttpStatus.NotFound, 'Pending payment not found');
            }

            // Update payment status to failed
            payment.status = PaymentStatusEnum.CANCELLED;
            payment.updated_at = new Date();
            await payment.save();

            // Update appointment payment status to failed
            const appointment = await this.appointmentSchema.findByIdAndUpdate(
                payment.appointment_id,
                { payment_status: AppointmentPaymentStatusEnum.FAILED },
                { new: true }
            );

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
                message: 'Payment cancelled successfully'
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

            const title = 'Payment Initiated';
            let message = `
                Your payment for ${service.name} has been initiated.
                <br><br>
                <strong>Payment Details:</strong>
                <br>
                Payment Number: ${payment.payment_no}
                <br>
                Amount: ${payment.amount.toLocaleString()} VND
                <br>
                Payment Method: ${payment.payment_method}
                <br><br>
            `;

            // Add specific instructions based on payment method
            if (payment.payment_method === PaymentMethodEnum.PAY_OS) {
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
                subject: 'Payment Initiated - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Payment initiated email sent to ${user.email}`);
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

            const title = 'Payment Successful';
            const message = `
                Your payment for ${service.name} has been successfully processed.
                <br><br>
                <strong>Payment Details:</strong>
                <br>
                Payment Number: ${payment.payment_no}
                <br>
                Amount: ${payment.amount.toLocaleString()} VND
                <br>
                Payment Method: ${payment.payment_method}
                <br>
                Payment Date: ${new Date().toLocaleString()}
                <br><br>
                Your appointment is now confirmed and our team will proceed with the next steps.
                <br><br>
                Thank you for choosing our services.
            `;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: 'Payment Successful - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Payment success email sent to ${user.email}`);
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
                html: createNotificationEmailTemplate(userName, title, message)
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
                html: createNotificationEmailTemplate(userName, title, message)
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
            updated_at: new Date()
        });
    }
}