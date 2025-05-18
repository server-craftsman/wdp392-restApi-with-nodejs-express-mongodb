import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { PaymentMethods, PaymentStatuses } from './payment.constant';
import { IPayment } from './payment.interface';

const PaymentSchemaEntity: Schema<IPayment> = new Schema({
    appointment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT, required: true },
    amount: { type: Number, required: true },
    payment_method: {
        type: String,
        enum: PaymentMethods,
        required: true
    },
    status: {
        type: String,
        enum: PaymentStatuses,
        required: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const PaymentSchema = mongoose.model<IPayment & mongoose.Document>(
    COLLECTION_NAME.PAYMENT,
    PaymentSchemaEntity
);

export default PaymentSchema; 