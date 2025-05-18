import { Document, Schema } from 'mongoose';
import { SlotStatusEnum } from './slot.enum';

export type SlotStatus =
    SlotStatusEnum.AVAILABLE |
    SlotStatusEnum.BOOKED |
    SlotStatusEnum.UNAVAILABLE;

export interface ISlot extends Document {
    _id: string;
    staff_profile_id: Schema.Types.ObjectId;
    appointment_id?: Schema.Types.ObjectId;
    appointment_limit: number;
    start_time: Date;
    end_time: Date;
    status: SlotStatus;
    created_at: Date;
    updated_at: Date;
} 