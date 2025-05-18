import { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
    _id: string;
    payment_id: Schema.Types.ObjectId;
    cashier_id: Schema.Types.ObjectId;
    receipt_number: string;
    vnpay_transaction_id?: string;
    vnpay_payment_status?: string;
    transaction_date: Date;
    created_at: Date;
    updated_at: Date;
} 