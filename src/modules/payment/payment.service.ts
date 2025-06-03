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
            return { success: false, message: 'Invalid signature' };
        }

        const { payment_no, amount, status } = data as CreateWebhookDto;

        const payment = await this.paymentSchema.findOne({
            $or: [
                { order_code: payment_no },
                { payment_no: payment_no }
            ],
            status: PaymentStatusEnum.PENDING
        });

        if (!payment) {
            return { success: false, message: 'Order not found' };
        }

        if (payment.amount !== Number(amount)) {
            return { success: false, message: 'Invalid amount' };
        }

        if (status === 'PAID') {
            payment.status = PaymentStatusEnum.COMPLETED;
            payment.payos_payment_status = 'PAID';
            payment.payos_payment_status_time = new Date();
            payment.updated_at = new Date();
            await payment.save();

            await this.appointmentSchema.findByIdAndUpdate(
                payment.appointment_id,
                { payment_status: AppointmentPaymentStatusEnum.PAID },
                { new: true }
            );

            // Create a transaction for each sample
            if (payment.sample_ids && payment.sample_ids.length > 0) {
                for (const sampleId of payment.sample_ids) {
                    await this.transactionSchema.create({
                        payment_id: payment._id,
                        receipt_number: `${payment_no}-${sampleId.toString().substring(0, 6)}`,
                        transaction_date: new Date(),
                        sample_id: sampleId,
                        payos_transaction_id: payment.payos_payment_id,
                        payos_payment_status: 'PAID',
                        payos_payment_status_time: new Date(),
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
                console.log(`Created ${payment.sample_ids.length} transactions for payment ${payment_no}`);
            } else {
                // Fallback if no samples
                await this.transactionSchema.create({
                    payment_id: payment._id,
                    receipt_number: payment_no,
                    transaction_date: new Date(),
                    payos_transaction_id: payment.payos_payment_id,
                    payos_payment_status: 'PAID',
                    payos_payment_status_time: new Date(),
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }

            return { success: true, message: 'Payment successful' };
        } else {
            payment.status = PaymentStatusEnum.FAILED;
            payment.payos_payment_status = status;
            payment.payos_payment_status_time = new Date();
            payment.updated_at = new Date();
            await payment.save();

            // Update appointment payment status to failed
            await this.appointmentSchema.findByIdAndUpdate(
                payment.appointment_id,
                { payment_status: AppointmentPaymentStatusEnum.FAILED },
                { new: true }
            );

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
                const { checkoutUrl } = await createPayosPayment(
                    amount,
                    paymentNo,
                    description,
                    `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                    user.email || '',
                    user.phone_number || ''
                );

                // Update payment with PayOS info
                await this.paymentSchema.findByIdAndUpdate(
                    payment._id,
                    {
                        payos_payment_url: checkoutUrl,
                        payment_no: paymentNo
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
     * Verify payment status (for manual verification or after redirect)
     * @param paymentNo Payment number to verify
     * @returns Updated payment status
     */
    public async verifyPaymentStatus(paymentNo: string): Promise<{
        success: boolean;
        payment_status: string;
        appointment_id: string;
    }> {
        try {
            const payment = await this.paymentSchema.findOne({
                $or: [
                    { payment_no: paymentNo },
                    { order_code: paymentNo }
                ]
            });

            if (!payment) {
                throw new HttpException(HttpStatus.NotFound, 'Payment not found');
            }

            // For CASH payment, we can mark it as completed here
            // In real-world scenario, this would be called by staff after receiving cash
            if (payment.payment_method === PaymentMethodEnum.CASH && payment.status === PaymentStatusEnum.PENDING) {
                payment.status = PaymentStatusEnum.COMPLETED;
                payment.payos_payment_status = 'PAID';
                payment.payos_payment_status_time = new Date();
                payment.updated_at = new Date();
                await payment.save();

                // Update appointment payment status
                await this.appointmentSchema.findByIdAndUpdate(
                    payment.appointment_id,
                    { payment_status: AppointmentPaymentStatusEnum.PAID },
                    { new: true }
                );

                // Create a transaction for each sample
                if (payment.sample_ids && payment.sample_ids.length > 0) {
                    for (const sampleId of payment.sample_ids) {
                        await this.transactionSchema.create({
                            payment_id: payment._id,
                            receipt_number: `${payment.payment_no || paymentNo}-${sampleId.toString().substring(0, 6)}`,
                            transaction_date: new Date(),
                            sample_id: sampleId,
                            payos_transaction_id: payment.payos_payment_id,
                            payos_payment_status: 'PAID',
                            payos_payment_status_time: new Date(),
                            payos_payment_status_code: 'PAID',
                            payos_payment_status_message: 'Thanh toán thành công',
                            payos_payment_status_detail: 'Thanh toán thành công',
                            created_at: new Date(),
                            updated_at: new Date(),
                        });
                    }
                    console.log(`Created ${payment.sample_ids.length} transactions for payment ${paymentNo}`);
                } else {
                    // Fallback if no samples
                    await this.transactionSchema.create({
                        payment_id: payment._id,
                        receipt_number: payment.payment_no || paymentNo,
                        transaction_date: new Date(),
                        payos_transaction_id: payment.payos_payment_id,
                        payos_payment_status: 'PAID',
                        payos_payment_status_time: new Date(),
                        payos_payment_status_code: 'PAID',
                        payos_payment_status_message: 'Thanh toán thành công',
                        payos_payment_status_detail: 'Thanh toán thành công',
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }

                return {
                    success: true,
                    payment_status: PaymentStatusEnum.COMPLETED,
                    appointment_id: payment.appointment_id.toString()
                };
            }

            // For PayOS, we would check the status from PayOS API
            // For now, just return the current status
            return {
                success: true,
                payment_status: payment.status,
                appointment_id: payment.appointment_id.toString()
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
            await this.appointmentSchema.findByIdAndUpdate(
                payment.appointment_id,
                { payment_status: AppointmentPaymentStatusEnum.FAILED },
                { new: true }
            );

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
                return await this.sampleService.getSamplesByAppointmentId(payment.appointment_id.toString());
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
}