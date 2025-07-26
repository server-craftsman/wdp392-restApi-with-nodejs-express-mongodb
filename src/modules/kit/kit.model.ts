import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { KitStatuses } from './kit.constant';
import { IKit } from './kit.interface';
import { KitStatusEnum, KitTypeEnum } from './kit.enum';

// Define schema with clear types
const KitSchemaEntity = new Schema({
    code: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: Object.values(KitTypeEnum),
        required: true,
        default: KitTypeEnum.REGULAR,
    },
    status: {
        type: String,
        enum: Object.values(KitStatusEnum),
        required: true,
        default: KitStatusEnum.AVAILABLE,
    },
    assigned_date: { type: Date },
    assigned_to_user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: false },
    return_date: { type: Date },
    notes: { type: String },
    // Administrative kit specific fields
    administrative_case_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.ADMINISTRATIVE_CASE, required: false },
    agency_authority: { type: String }, // Cơ quan thẩm quyền
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

// Create and export the model with explicit typing
const KitSchema = mongoose.model<IKit>(COLLECTION_NAME.KIT, KitSchemaEntity);
export default KitSchema;
