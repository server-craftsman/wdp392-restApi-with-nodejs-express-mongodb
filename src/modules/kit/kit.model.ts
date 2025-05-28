import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { KitStatuses } from './kit.constant';
import { IKit } from './kit.interface';

const KitSchemaEntity: Schema<IKit> = new Schema({
    code: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: KitStatuses,
        required: true
    },
    appointment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT, required: false },
    assigned_date: { type: Date },
    assigned_to_user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: false },
    return_date: { type: Date },
    notes: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const KitSchema = mongoose.model<IKit & mongoose.Document>(COLLECTION_NAME.KIT, KitSchemaEntity);
export default KitSchema; 