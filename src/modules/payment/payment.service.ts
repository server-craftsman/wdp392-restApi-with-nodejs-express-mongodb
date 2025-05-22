import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { createPayosPayment, verifyPayosWebhook } from './payment.util';
import PaymentSchema from './payment.model';
import { AppointmentSchema } from '../appointment';
import { TransactionSchema } from '../transaction';
import { PaymentMethodEnum, PaymentStatusEnum } from './payment.enum';
import { CreatePayosPaymentDto } from './dtos/create-payos-payment.dto';

export default class PaymentService {
    public paymentSchema = PaymentSchema;
    public appointmentSchema = AppointmentSchema;
    public transactionSchema = TransactionSchema;

    /**
     * Create a payment for an appointment with PayOS
     */
    public async createPayment(userId: string, createPaymentDto: CreatePayosPaymentDto): Promise<string> {
        const appointment = await this.appointmentSchema.findById(createPaymentDto.appointment_id);
        if (!appointment) {
            throw new HttpException(HttpStatus.BadRequest, 'Appointment not found');
        }

        if (appointment.user_id && appointment.user_id.toString() !== userId) {
            throw new HttpException(HttpStatus.Forbidden, 'You do not have permission to pay for this appointment');
        }

        const existingPayment = await this.paymentSchema.findOne({ appointment_id: createPaymentDto.appointment_id });
        if (existingPayment && (existingPayment.status === PaymentStatusEnum.COMPLETED || existingPayment.status === PaymentStatusEnum.PENDING)) {
            throw new HttpException(HttpStatus.BadRequest, 'Payment already exists for this appointment');
        }

        if (createPaymentDto.amount <= 0) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid payment amount');
        }

        const orderCode = `PAY-${uuidv4().substring(0, 8)}-${moment().format('HHmmss')}`;

        let payment;
        if (existingPayment) {
            existingPayment.status = PaymentStatusEnum.PENDING;
            existingPayment.order_code = orderCode;
            existingPayment.amount = createPaymentDto.amount;
            existingPayment.updated_at = new Date();
            payment = await existingPayment.save();
        } else {
            payment = await this.paymentSchema.create({
                appointment_id: createPaymentDto.appointment_id,
                amount: createPaymentDto.amount,
                payment_method: PaymentMethodEnum.PAY_OS,
                status: PaymentStatusEnum.PENDING,
                order_id: orderCode,
                order_code: orderCode,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        const description = `Thanh toan cho don hang ${orderCode}`;
        const { checkoutUrl } = await createPayosPayment(
            createPaymentDto.amount,
            orderCode,
            description,
            createPaymentDto.buyer_name,
            createPaymentDto.buyer_email,
            createPaymentDto.buyer_phone
        );

        return checkoutUrl;
    }

    /**
     * Process PayOS Webhook
     */
    public async processPayosWebhook(data: any): Promise<{ success: boolean; message: string }> {
        const receivedSignature = data.signature;
        const isValidSignature = verifyPayosWebhook(data, receivedSignature);
        if (!isValidSignature) {
            return { success: false, message: 'Invalid signature' };
        }

        const { orderCode, amount, status } = data;
        const payment = await this.paymentSchema.findOne({ order_code: orderCode, status: PaymentStatusEnum.PENDING });
        if (!payment) {
            return { success: false, message: 'Order not found' };
        }

        if (payment.amount !== amount) {
            return { success: false, message: 'Invalid amount' };
        }

        if (status === 'PAID') {
            payment.status = PaymentStatusEnum.COMPLETED;
            payment.updated_at = new Date();
            await payment.save();

            await this.transactionSchema.create({
                payment_id: payment._id,
                receipt_number: orderCode,
                transaction_date: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            });

            return { success: true, message: 'Payment successful' };
        } else {
            payment.status = PaymentStatusEnum.FAILED;
            payment.updated_at = new Date();
            await payment.save();
            return { success: true, message: 'Payment failed' };
        }
    }
}