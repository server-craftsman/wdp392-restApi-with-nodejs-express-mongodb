import { Document } from 'mongoose';
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
    assigned_date?: Date;
    return_date?: Date;
    created_at: Date;
    updated_at: Date;
} 