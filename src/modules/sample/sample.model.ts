import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { SampleStatuses, SampleTypes, CollectionMethods } from './sample.constant';
import { ISample } from './sample.interface';

const PersonInfoSchema = new Schema({
    name: { type: String, required: true },
    dob: { type: Date },
    relationship: { type: String },
    birth_place: { type: String },
    nationality: { type: String },
    identity_document: { type: String },
    image_url: { type: String }
}, { _id: false });

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
    person_info: { type: PersonInfoSchema },
    person_info_list: { type: [PersonInfoSchema] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: String },
    updated_by: { type: String }
});

const SampleSchema = mongoose.model<ISample & mongoose.Document>(COLLECTION_NAME.SAMPLE, SampleSchemaEntity);
export default SampleSchema; 