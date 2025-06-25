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

export default class PaymentService {
    private paymentSchema = PaymentSchema;
    private appointmentSchema = AppointmentSchema;
    private transactionSchema = TransactionSchema;
    private sampleService = new SampleService();
    private userService = new UserService();

    /**
     * Process PayOS Webhook
     */
    public async processPayosWebhook(data: CreateWebhookDto): Promise<{ success: boolean; message: string }> {
        const receivedSignature = data.signature || '';
        const isValidSignature = verifyPayosWebhook(data, receivedSignature);
        if (!isValidSignature) {
            console.error('PayOS Webhook: Invalid signature received');
            return { success: false, message: 'Invalid signature' };
        }

        const { payment_no, amount, status } = data as CreateWebhookDto;
        console.log(`Processing PayOS webhook for payment ${payment_no} with status ${status}`);

        // Find the payment by payment_no
        const payment = await this.paymentSchema.findOne({
            $or: [
                { payment_no: payment_no }
            ],
            status: { $in: [PaymentStatusEnum.PENDING] }
        });

        if (!payment) {
            console.error(`PayOS Webhook: Payment not found or not in pending status: ${payment_no}`);
            return { success: false, message: 'Order not found or already processed' };
        }

        if (payment.amount !== Number(amount)) {
            console.error(`PayOS Webhook: Amount mismatch. Expected: ${payment.amount}, Received: ${amount}`);
            return { success: false, message: 'Invalid amount' };
        }

        // Update payment with webhook received timestamp
        payment.payos_webhook_received_at = new Date();

        if (status === TransactionStatusEnum.SUCCESS) {
            console.log(`Payment ${payment_no} successful, updating status to COMPLETED`);

            // Update payment status
            payment.status = PaymentStatusEnum.COMPLETED;
            payment.payos_payment_status = TransactionStatusEnum.SUCCESS;
            payment.payos_payment_status_time = new Date();
            payment.updated_at = new Date();
            await payment.save();

            // Update appointment payment status
            const appointment = await this.appointmentSchema.findByIdAndUpdate(
                payment.appointment_id,
                {
                    payment_status: AppointmentPaymentStatusEnum.PAID,
                    status: AppointmentStatusEnum.CONFIRMED
                },
                { new: true }
            );

            if (!appointment) {
                console.error(`PayOS Webhook: Appointment not found for payment ${payment_no}`);
            } else {
                console.log(`Updated appointment ${appointment._id} status to CONFIRMED and payment_status to PAID`);
            }

            // Create transactions for each sample
            if (payment.sample_ids && payment.sample_ids.length > 0) {
                const transactionPromises = payment.sample_ids.map(async (sampleId) => {
                    const transaction = await this.transactionSchema.findOneAndUpdate(
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
                    return transaction;
                });

                try {
                    const transactions = await Promise.all(transactionPromises);
                    console.log(`Created/updated ${transactions.length} transactions for payment ${payment_no}`);
                } catch (transactionError) {
                    console.error(`Error creating transactions for payment ${payment_no}:`, transactionError);
                }
            } else {
                // Fallback if no samples - create a single transaction
                try {
                    await this.transactionSchema.findOneAndUpdate(
                        { payment_id: payment._id },
                        {
                            payment_id: payment._id,
                            receipt_number: payment_no,
                            transaction_date: new Date(),
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
                    console.log(`Created fallback transaction for payment ${payment_no}`);
                } catch (transactionError) {
                    console.error(`Error creating fallback transaction for payment ${payment_no}:`, transactionError);
                }
            }

            // Send payment success email
            try {
                if (appointment) {
                    await this.sendPaymentSuccessEmail(payment, appointment);
                }
            } catch (emailError) {
                console.error('Failed to send payment success email:', emailError);
            }

            return { success: true, message: 'Payment successful' };
        } else {
            console.log(`Payment ${payment_no} failed or cancelled with status ${status}`);

            // Update payment status
            payment.status = PaymentStatusEnum.FAILED;
            payment.payos_payment_status = status;
            payment.payos_payment_status_time = new Date();
            payment.updated_at = new Date();
            await payment.save();

            // Update appointment payment status to failed
            const appointment = await this.appointmentSchema.findByIdAndUpdate(
                payment.appointment_id,
                { payment_status: AppointmentPaymentStatusEnum.FAILED },
                { new: true }
            );

            // Update any existing transactions to failed status
            if (payment.sample_ids && payment.sample_ids.length > 0) {
                await this.transactionSchema.updateMany(
                    { payment_id: payment._id },
                    {
                        payos_payment_status: TransactionStatusEnum.FAILED,
                        payos_payment_status_time: new Date(),
                        payos_webhook_received_at: new Date(),
                        updated_at: new Date(),
                    }
                );
            }

            // Send payment failed email
            try {
                if (appointment) {
                    await this.sendPaymentFailedEmail(payment, appointment);
                }
            } catch (emailError) {
                console.error('Failed to send payment failed email:', emailError);
            }

            return { success: true, message: 'Payment failed' };
        }
    }

    /**
     * Create payment for appointment with selected payment method
     * @param userId ID of the user making the payment
     * @param paymentData Payment data including method and appointment ID
     * @returns Payment details including checkout URL if PAY_OS is selected
     */
    public async createAppointmentPayment(userId: string, paymentData: CreateAppointmentPaymentDto): Promise<{
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
                throw new HttpException(HttpStatus.Forbidden, 'You do not have permission to pay for this appointment');
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
                    user.phone_number || ''
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
     * Verify payment status and update Payment & Appointment Schema accordingly.
     * This method will try to find payment by payment_no first, then by payos_order_code if not found.
     * After creating a Payment, you can call this to update status for Payment to completed & Appointment to paid,
     * and create transaction info.
     * @param paymentIdentifier Payment number or PayOS order code to verify
     * @returns Updated payment status and appointment id
     */
    public async verifyPaymentStatus(paymentIdentifier: string): Promise<{
        payment_status: string;
        appointment_id: string;
        paymentNo: string;
    }> {
        try {
            // Try to find payment by payment_no first
            let payment = await this.paymentSchema.findOne({ payment_no: paymentIdentifier });

            // If not found, try by payos_order_code (number)
            if (!payment && /^\d+$/.test(paymentIdentifier)) {
                payment = await this.paymentSchema.findOne({ payos_order_code: parseInt(paymentIdentifier, 10) });
            }

            if (!payment) {
                throw new HttpException(HttpStatus.NotFound, 'Payment not found');
            }

            // If payment is already completed, just return
            if (payment.status === PaymentStatusEnum.COMPLETED) {
                return {
                    paymentNo: payment.payment_no || paymentIdentifier,
                    payment_status: PaymentStatusEnum.COMPLETED,
                    appointment_id: payment.appointment_id || ''
                };
            }

            // For CASH payment, mark as completed if still pending
            if (payment.payment_method === PaymentMethodEnum.CASH && payment.status === PaymentStatusEnum.PENDING) {
                // Update payment status
                const updatedPayment = await this.paymentSchema.findByIdAndUpdate(
                    payment._id,
                    {
                        status: PaymentStatusEnum.COMPLETED,
                        payos_payment_status: 'PAID',
                        payos_payment_status_time: new Date(),
                        updated_at: new Date()
                    },
                    { new: true }
                );

                // Update appointment payment status
                const updatedAppointment = await this.appointmentSchema.findByIdAndUpdate(
                    payment.appointment_id,
                    { payment_status: AppointmentPaymentStatusEnum.PAID },
                    { new: true }
                );

                // Create a transaction for each sample
                if (payment.sample_ids && payment.sample_ids.length > 0) {
                    for (const sampleId of payment.sample_ids) {
                        await this.transactionSchema.create({
                            payment_id: payment._id,
                            receipt_number: `${payment.payment_no || paymentIdentifier}-${sampleId.toString().substring(0, 6)}`,
                            transaction_date: new Date(),
                            sample_id: sampleId,
                            payos_transaction_id: payment.payos_payment_id,
                            payos_payment_status: TransactionStatusEnum.SUCCESS,
                            payos_payment_status_time: new Date(),
                            payos_payment_status_code: 'PAID',
                            payos_payment_status_message: 'Thanh toán thành công',
                            payos_payment_status_detail: 'Thanh toán thành công',
                            created_at: new Date(),
                            updated_at: new Date(),
                        });
                    }
                } else {
                    // Fallback if no samples
                    await this.transactionSchema.create({
                        payment_id: payment._id,
                        receipt_number: payment.payment_no || paymentIdentifier,
                        transaction_date: new Date(),
                        payos_transaction_id: payment.payos_payment_id,
                        payos_payment_status: TransactionStatusEnum.SUCCESS,
                        payos_payment_status_time: new Date(),
                        payos_payment_status_code: 'PAID',
                        payos_payment_status_message: 'Thanh toán thành công',
                        payos_payment_status_detail: 'Thanh toán thành công',
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }

                // Send payment success email
                try {
                    if (updatedAppointment) {
                        await this.sendPaymentSuccessEmail(updatedPayment, updatedAppointment);
                    }
                } catch (emailError) {
                    console.error('Failed to send payment success email:', emailError);
                }

                return {
                    paymentNo: payment.payment_no || paymentIdentifier,
                    payment_status: PaymentStatusEnum.COMPLETED,
                    appointment_id: payment.appointment_id || ''
                };
            }

            // For PayOS or other methods, you may want to check with the payment gateway here
            // For now, just return the current status

            return {
                paymentNo: payment.payment_no || paymentIdentifier,
                payment_status: payment.status,
                appointment_id: payment.appointment_id || ''
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error verifying payment');
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
            payment.status = PaymentStatusEnum.FAILED;
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
            method: PaymentMethodEnum.GOVERNMENT,
            status: PaymentStatusEnum.COMPLETED,
            created_at: new Date(),
            updated_at: new Date()
        });
    }
}