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
    assigned_date: { type: Date },
    return_date: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const KitSchema = mongoose.model<IKit & mongoose.Document>(COLLECTION_NAME.KIT, KitSchemaEntity);
export default KitSchema; 