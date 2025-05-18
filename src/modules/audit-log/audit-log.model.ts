import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { AuditActions, EntityTypes } from './audit-log.constant';
import { IAuditLog } from './audit-log.interface';

const AuditLogSchemaEntity: Schema<IAuditLog> = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    action: {
        type: String,
        enum: AuditActions,
        required: true
    },
    entity_type: {
        type: String,
        enum: EntityTypes,
        required: true
    },
    entity_id: { type: Schema.Types.ObjectId, required: true },
    details: { type: Schema.Types.Mixed },
    created_at: { type: Date, default: Date.now }
});

const AuditLogSchema = mongoose.model<IAuditLog & mongoose.Document>(
    COLLECTION_NAME.AUDIT_LOG,
    AuditLogSchemaEntity
);

export default AuditLogSchema; 