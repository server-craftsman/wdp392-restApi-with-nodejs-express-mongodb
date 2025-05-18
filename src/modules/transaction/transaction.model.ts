import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { ITransaction } from './transaction.interface';

const TransactionSchemaEntity: Schema<ITransaction> = new Schema({
    payment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.PAYMENT, required: true, unique: true },
    cashier_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    receipt_number: { type: String, required: true },
    vnpay_transaction_id: { type: String },
    vnpay_payment_status: { type: String },
    transaction_date: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const TransactionSchema = mongoose.model<ITransaction & mongoose.Document>(
    COLLECTION_NAME.TRANSACTION,
    TransactionSchemaEntity
);

export default TransactionSchema; 