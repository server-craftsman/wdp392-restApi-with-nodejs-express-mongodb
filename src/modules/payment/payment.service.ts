import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { COLLECTION_NAME } from '../../core/constants';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { createVnpayPaymentUrl, verifyVnpayReturn } from './payment.util';
import { IPayment } from './payment.interface';
import PaymentSchema from './payment.model';
import { AppointmentSchema } from '../appointment';
import { TransactionSchema } from '../transaction';
import { PaymentMethodEnum, PaymentStatusEnum } from './payment.enum';
import { CreatePaymentDto } from './dtos/create-payment.dto';

export default class PaymentService {
    public paymentSchema = PaymentSchema;
    public appointmentSchema = AppointmentSchema;
    public transactionSchema = TransactionSchema;

    /**
     * Create a payment for an appointment
     */
    public async createPayment(userId: string, createPaymentDto: CreatePaymentDto, ipAddr: string): Promise<string> {
        // Check if appointment exists
        const appointment = await this.appointmentSchema.findById(createPaymentDto.appointment_id);
        if (!appointment) {
            throw new HttpException(HttpStatus.BadRequest, 'Appointment not found');
        }

        // Check if appointment belongs to user
        if (appointment.user_id && appointment.user_id.toString() !== userId) {
            throw new HttpException(HttpStatus.Forbidden, 'You do not have permission to pay for this appointment');
        }

        // Check if payment already exists for this appointment
        const existingPayment = await this.paymentSchema.findOne({ appointment_id: createPaymentDto.appointment_id });
        if (existingPayment && (existingPayment.status === PaymentStatusEnum.COMPLETED || existingPayment.status === PaymentStatusEnum.PENDING)) {
            throw new HttpException(HttpStatus.BadRequest, 'Payment already exists for this appointment');
        }

        // Validate amount
        if (createPaymentDto.amount <= 0) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid payment amount');
        }

        // Create a unique order ID
        const orderId = `PAY-${uuidv4().substring(0, 8)}-${moment().format('HHmmss')}`;

        // Create or update payment record
        let payment;
        if (existingPayment) {
            existingPayment.status = PaymentStatusEnum.PENDING;
            existingPayment.order_id = orderId; // Lưu orderId
            existingPayment.amount = createPaymentDto.amount;
            existingPayment.updated_at = new Date();
            payment = await existingPayment.save();
        } else {
            payment = await this.paymentSchema.create({
                appointment_id: createPaymentDto.appointment_id,
                amount: createPaymentDto.amount,
                payment_method: PaymentMethodEnum.VNPAY,
                status: PaymentStatusEnum.PENDING,
                order_id: orderId, // Lưu orderId
                created_at: new Date(),
                updated_at: new Date(),
            });
        }

        // Generate VNPAY URL
        const orderInfo = `Thanh toan cho don hang ${orderId}`;
        const paymentUrl = createVnpayPaymentUrl(
            createPaymentDto.amount,
            orderInfo,
            ipAddr,
            orderId,
            createPaymentDto.bankCode || '',
            createPaymentDto.language || 'vn'
        );

        return paymentUrl;
    }

    /**
     * Process VNPAY IPN (Instant Payment Notification)
     */
    public async processVnpayIpn(vnpParams: any): Promise<{ RspCode: string; Message: string }> {
        // Verify the return data
        const isValidSignature = verifyVnpayReturn(vnpParams);
        if (!isValidSignature) {
            return { RspCode: '97', Message: 'Invalid signature' };
        }

        // Extract transaction information
        const txnRef = vnpParams.vnp_TxnRef;
        const responseCode = vnpParams.vnp_ResponseCode;
        const transactionId = vnpParams.vnp_TransactionNo;
        const amount = Number(vnpParams.vnp_Amount) / 100;

        // Find the payment by order_id (txnRef)
        const payment = await this.paymentSchema.findOne({
            order_id: txnRef,
            status: PaymentStatusEnum.PENDING,
        });

        if (!payment) {
            return { RspCode: '01', Message: 'Order not found' };
        }

        // Check if amount matches
        if (payment.amount !== amount) {
            return { RspCode: '04', Message: 'Invalid amount' };
        }

        // Update payment status based on VNPay response code
        if (responseCode === '00') {
            payment.status = PaymentStatusEnum.COMPLETED;
            payment.updated_at = new Date();
            await payment.save();

            // Create transaction record
            await this.transactionSchema.create({
                payment_id: payment._id,
                cashier_id: null,
                receipt_number: txnRef,
                vnpay_transaction_id: transactionId,
                vnpay_payment_status: 'Success',
                transaction_date: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            });

            return { RspCode: '00', Message: 'Success' };
        } else {
            payment.status = PaymentStatusEnum.FAILED;
            payment.updated_at = new Date();
            await payment.save();

            return { RspCode: '00', Message: 'Success' }; // VNPAY yêu cầu trả về success để xác nhận đã nhận IPN
        }
    }

    /**
     * Process VNPAY Return URL
     */
    public async processVnpayReturn(vnpParams: any): Promise<{ success: boolean; message: string; data?: any }> {
        // Verify the return data
        const isValidSignature = verifyVnpayReturn(vnpParams);
        if (!isValidSignature) {
            return { success: false, message: 'Invalid signature' };
        }

        // Extract transaction information
        const txnRef = vnpParams.vnp_TxnRef;
        const responseCode = vnpParams.vnp_ResponseCode;
        const amount = Number(vnpParams.vnp_Amount) / 100;

        // Find the payment by order_id
        const payment = await this.paymentSchema.findOne({ order_id: txnRef });
        if (!payment) {
            return { success: false, message: 'Payment not found' };
        }

        // Get appointment details
        const appointment = await this.appointmentSchema.findById(payment.appointment_id);
        if (!appointment) {
            return { success: false, message: 'Appointment not found' };
        }

        // Return payment information
        return {
            success: responseCode === '00',
            message: responseCode === '00' ? 'Payment successful' : 'Payment failed',
            data: {
                transactionRef: txnRef,
                responseCode: responseCode,
                amount: amount,
                appointmentId: appointment._id,
                paymentId: payment._id,
                status: payment.status,
            },
        };
    }
} 