import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IResult } from './result.interface';

const ResultSchemaEntity: Schema<IResult> = new Schema({
    sample_ids: { type: [Schema.Types.ObjectId], ref: COLLECTION_NAME.SAMPLE, required: true },
    customer_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    appointment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT, required: true },
    laboratory_technician_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    is_match: { type: Boolean, required: true },
    result_data: { type: Schema.Types.Mixed },
    report_url: { type: String },
    completed_at: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const ResultSchema = mongoose.model<IResult & mongoose.Document>(
    COLLECTION_NAME.RESULT,
    ResultSchemaEntity
);

export default ResultSchema; 