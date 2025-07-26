import { Document, Schema } from 'mongoose';
import { KitStatusEnum, KitTypeEnum } from './kit.enum';

export type KitStatus = KitStatusEnum.AVAILABLE | KitStatusEnum.ASSIGNED | KitStatusEnum.USED | KitStatusEnum.RETURNED | KitStatusEnum.DAMAGED;

export type KitType = KitTypeEnum.REGULAR | KitTypeEnum.ADMINISTRATIVE;

export interface IKit extends Document {
    _id: string;
    code: string;
    type: KitType; // Loại kit: regular hoặc administrative
    status: KitStatus;
    assigned_date?: Date;
    assigned_to_user_id?: string | undefined;
    return_date?: Date;
    notes?: string;
    // Thông tin cho administrative kit
    administrative_case_id?: string | undefined; // ID của case pháp lý
    agency_authority?: string; // Cơ quan thẩm quyền
    created_at: Date;
    updated_at: Date;
}
