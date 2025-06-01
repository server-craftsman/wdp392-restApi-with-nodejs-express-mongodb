import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IPayment } from './payment.interface';
import { PaymentMethodEnum, PaymentStatusEnum } from './payment.enum';

const PaymentSchemaEntity: Schema<IPayment> = new Schema({
    appointment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT, required: true },
    sample_ids: [{ type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SAMPLE }],
    amount: { type: Number, required: true },
    payment_no: { type: String },
    payment_method: {
        type: String,
        enum: Object.values(PaymentMethodEnum),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(PaymentStatusEnum),
        default: PaymentStatusEnum.PENDING
    },
    balance_origin: { type: Number, default: 0 },
    payos_payment_id: { type: String },
    payos_payment_url: { type: String },
    payos_payment_status: { type: String },
    payos_payment_status_message: { type: String },
    payos_payment_status_code: { type: String },
    payos_payment_status_detail: { type: String },
    payos_payment_status_time: { type: Date },

    // demo payOs
    order_code: { type: String },
    order_id: { type: String },
    // end demo payOs

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const PaymentSchema = mongoose.model<IPayment & mongoose.Document>(
    COLLECTION_NAME.PAYMENT,
    PaymentSchemaEntity
);

export default PaymentSchema; 