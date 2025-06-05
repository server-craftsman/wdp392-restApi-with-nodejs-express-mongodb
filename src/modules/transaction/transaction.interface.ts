import { Document, Schema } from 'mongoose';
import { TransactionStatusEnum } from './transaction.enum';
export interface ITransaction extends Document {
    _id: string;
    payment_id: string | undefined;
    staff_id: string | undefined;
    customer_id: string | undefined;
    sample_id: string | undefined;
    receipt_number: string;
    payos_transaction_id?: string;
    payos_payment_status?: TransactionStatusEnum;
    payos_webhook_received_at?: Date;
    payos_payment_status_message?: string;
    payos_payment_status_code?: string;
    payos_payment_status_detail?: string;
    payos_payment_status_time?: Date;
    transaction_date: Date;
    created_at: Date;
    updated_at: Date;
} 