import { Document, Schema } from 'mongoose';
import { PaymentMethodEnum, PaymentStatusEnum } from './payment.enum';

export type PaymentMethod =
    PaymentMethodEnum.CASH |
    PaymentMethodEnum.PAY_OS;

export type PaymentStatus =
    PaymentStatusEnum.PENDING |
    PaymentStatusEnum.COMPLETED |
    PaymentStatusEnum.FAILED |
    PaymentStatusEnum.CANCELLED |
    PaymentStatusEnum.REFUNDED;

export interface IPayment extends Document {
    _id: string;
    appointment_id: string | undefined;
    sample_ids?: string[] | undefined;
    amount: number;
    payment_no?: string;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    balance_origin: number;
    payos_payment_id?: string;
    payos_payment_url?: string;
    payos_payment_status?: string;
    payos_order_code?: number;
    payos_web_id?: string;
    payos_payment_status_message?: string;
    payos_payment_status_code?: string;
    payos_payment_status_detail?: string;
    payos_payment_status_time?: Date;
    payos_webhook_received_at?: Date;

    payer_name?: string;
    payer_email?: string;
    payer_phone?: string | number;

    // // demo payOs
    // order_code?: string;
    // order_id?: string;
    // // end demo payOs

    created_at: Date;
    updated_at: Date;
} 