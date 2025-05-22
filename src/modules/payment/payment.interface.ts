import { Document, Schema } from 'mongoose';
import { PaymentMethodEnum, PaymentStatusEnum } from './payment.enum';

export type PaymentMethod =
    PaymentMethodEnum.CASH |
    PaymentMethodEnum.PAY_OS;

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
    balance_origin: number;
    payos_payment_id?: string;
    payos_payment_url?: string;
    payos_payment_status?: string;
    payos_payment_status_message?: string;
    payos_payment_status_code?: string;
    payos_payment_status_detail?: string;
    payos_payment_status_time?: Date;
    
    // demo payOs
    order_code?: string;
    order_id?: string;
    // end demo payOs
    
    created_at: Date;
    updated_at: Date;
} 