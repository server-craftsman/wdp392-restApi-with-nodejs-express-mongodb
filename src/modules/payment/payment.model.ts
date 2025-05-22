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
    // demo payOs
    order_id: { type: String },
    order_code: { type: String },   
    // end demo payOs
    payos_payment_id: { type: String },
    payos_payment_url: { type: String },
    payos_payment_status: { type: String },
    payos_payment_status_message: { type: String },
    payos_payment_status_code: { type: String },
    payos_payment_status_detail: { type: String },
    payos_payment_status_time: { type: Date },
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