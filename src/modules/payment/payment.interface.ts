import { Document, Schema } from 'mongoose';
import { PaymentMethodEnum, PaymentStatusEnum } from './payment.enum';

export type PaymentMethod =
    PaymentMethodEnum.CASH |
    PaymentMethodEnum.VNPAY;

export type PaymentStatus =
    PaymentStatusEnum.PENDING |
    PaymentStatusEnum.COMPLETED |
    PaymentStatusEnum.FAILED |
    PaymentStatusEnum.REFUNDED;

export interface IPayment extends Document {
    _id: string;
    appointment_id: Schema.Types.ObjectId;
    amount: number;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    order_code: string;
    order_id: string;
    created_at: Date;
    updated_at: Date;
} 