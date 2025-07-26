import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { ICertificateRequest } from './result.interface';

const CertificateRequestSchemaEntity = new Schema({
    result_id: {
        type: Schema.Types.ObjectId,
        ref: COLLECTION_NAME.RESULT,
        required: true
    },
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: COLLECTION_NAME.USER,
        required: true
    },
    request_count: {
        type: Number,
        required: true,
        default: 1
    },
    reason: {
        type: String,
        required: true
    },
    payment_id: {
        type: Schema.Types.ObjectId,
        ref: COLLECTION_NAME.PAYMENT,
        required: false
    },
    is_paid: {
        type: Boolean,
        default: false
    },
    certificate_issued_at: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'issued', 'rejected'],
        default: 'pending'
    },
    agency_notes: {
        type: String
    },
    delivery_address: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const CertificateRequestSchema = mongoose.model<ICertificateRequest>(
    'CertificateRequest',
    CertificateRequestSchemaEntity
);

export default CertificateRequestSchema; 