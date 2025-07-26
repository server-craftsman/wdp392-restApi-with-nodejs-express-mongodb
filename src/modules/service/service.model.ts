import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { SampleMethods, ServiceTypes } from './service.constant';
import { IService } from './service.interface';

const ServiceSchemaEntity: Schema<IService> = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    parent_service_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SERVICE },
    type: {
        type: String,
        enum: ServiceTypes,
        required: true,
    },
    // sample_method: {
    //     type: String,
    //     enum: SampleMethods,
    //     required: true
    // },
    estimated_time: { type: Number, required: true }, // in hours
    price: { type: Number, required: true },
    image_url: { type: String },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const ServiceSchema = mongoose.model<IService & mongoose.Document>(COLLECTION_NAME.SERVICE, ServiceSchemaEntity);
export default ServiceSchema;
