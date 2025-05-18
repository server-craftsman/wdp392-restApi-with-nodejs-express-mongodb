import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { SampleStatuses, SampleTypes, CollectionMethods } from './sample.constant';
import { ISample } from './sample.interface';

const SampleSchemaEntity: Schema<ISample> = new Schema({
    appointment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT, required: true },
    kit_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.KIT, required: true },
    type: {
        type: String,
        enum: SampleTypes,
        required: true
    },
    collection_method: {
        type: String,
        enum: CollectionMethods,
        required: true
    },
    collection_date: { type: Date, required: true },
    received_date: { type: Date },
    status: {
        type: String,
        enum: SampleStatuses,
        required: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const SampleSchema = mongoose.model<ISample & mongoose.Document>(COLLECTION_NAME.SAMPLE, SampleSchemaEntity);
export default SampleSchema; 