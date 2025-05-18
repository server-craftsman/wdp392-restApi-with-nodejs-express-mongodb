import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { RefundMethods, RefundStatuses } from './refund.constant';
import { IRefund } from './refund.interface';

const RefundSchemaEntity: Schema<IRefund> = new Schema({
    payment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.PAYMENT, required: true, unique: true },
    requester_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    approver_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: RefundStatuses,
        required: true
    },
    refund_method: {
        type: String,
        enum: RefundMethods,
        required: true
    },
    refund_transaction_id: { type: String },
    refund_date: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const RefundSchema = mongoose.model<IRefund & mongoose.Document>(
    COLLECTION_NAME.REFUND,
    RefundSchemaEntity
);

export default RefundSchema; 