import { Document, Schema } from 'mongoose';
import { AuditActionEnum, EntityTypeEnum } from './audit-log.enum';

export type AuditAction =
    AuditActionEnum.CREATE |
    AuditActionEnum.UPDATE |
    AuditActionEnum.DELETE |
    AuditActionEnum.VIEW |
    AuditActionEnum.LOGIN |
    AuditActionEnum.LOGOUT;

export type EntityType =
    EntityTypeEnum.USER |
    EntityTypeEnum.SERVICE |
    EntityTypeEnum.APPOINTMENT |
    EntityTypeEnum.KIT |
    EntityTypeEnum.SAMPLE |
    EntityTypeEnum.RESULT |
    EntityTypeEnum.PAYMENT |
    EntityTypeEnum.TRANSACTION |
    EntityTypeEnum.BLOG;

export interface IAuditLogDetails {
    [key: string]: any;
}

export interface IAuditLog extends Document {
    _id: string;
    user_id: Schema.Types.ObjectId;
    action: AuditAction;
    entity_type: EntityType;
    entity_id: Schema.Types.ObjectId;
    details: IAuditLogDetails;
    created_at: Date;
} 