import { Document, Schema } from 'mongoose';
import { TransactionStatusEnum } from './transaction.enum';
export interface ITransaction extends Document {
    _id: string;
    payment_id: Schema.Types.ObjectId;
    staff_id: Schema.Types.ObjectId;
    customer_id: Schema.Types.ObjectId;
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