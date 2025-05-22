import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { ITransaction } from './transaction.interface';
import { TransactionStatuses } from './transaction.constant';
const TransactionSchemaEntity: Schema<ITransaction> = new Schema({
    payment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.PAYMENT, required: true, unique: true },
    staff_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    customer_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    receipt_number: { type: String, required: true },
    payos_transaction_id: { type: String },
    payos_payment_status: { type: String, enum: TransactionStatuses },
    payos_webhook_received_at: { type: Date },
    payos_payment_status_message: { type: String },
    payos_payment_status_code: { type: String },
    payos_payment_status_detail: { type: String },
    payos_payment_status_time: { type: Date },
    transaction_date: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const TransactionSchema = mongoose.model<ITransaction & mongoose.Document>(
    COLLECTION_NAME.TRANSACTION,
    TransactionSchemaEntity
);

export default TransactionSchema; 