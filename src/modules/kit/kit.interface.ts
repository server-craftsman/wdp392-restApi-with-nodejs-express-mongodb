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
    appointment_id?: string | undefined;
    assigned_date?: Date;
    assigned_to_user_id?: string | undefined;
    return_date?: Date;
    notes?: string;
    created_at: Date;
    updated_at: Date;
} 