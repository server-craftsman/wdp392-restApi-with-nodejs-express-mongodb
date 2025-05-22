import { Document, Schema } from 'mongoose';
import { KitStatusEnum } from './kit.enum';

export type KitStatus =
    KitStatusEnum.AVAILABLE |
    KitStatusEnum.ASSIGNED |
    KitStatusEnum.USED |
    KitStatusEnum.RETURNED |
    KitStatusEnum.DAMAGED;

export interface IKit extends Document {
    _id: string;
    code: string;
    status: KitStatus;
    appointment_id: Schema.Types.ObjectId;
    assigned_date?: Date;
    assigned_to_user_id: Schema.Types.ObjectId;
    return_date?: Date;
    created_at: Date;
    updated_at: Date;
} 