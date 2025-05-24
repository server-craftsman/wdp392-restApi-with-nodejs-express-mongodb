import { Document, Schema } from 'mongoose';
import { SlotStatusEnum } from './slot.enum';

export type SlotStatus =
    SlotStatusEnum.AVAILABLE |
    SlotStatusEnum.BOOKED |
    SlotStatusEnum.UNAVAILABLE;

export enum SlotPattern {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly'
}

export interface ITimeSlot {
    start_hour: number;
    start_minute: number;
    end_hour: number;
    end_minute: number;
}

export interface ISlot extends Document {
    _id: string;
    service_id?: Schema.Types.ObjectId;
    staff_profile_ids: Schema.Types.ObjectId[] | string[];
    appointment_id?: Schema.Types.ObjectId;
    appointment_limit: number; //max appointment per slot
    pattern: SlotPattern | string;
    start_time: Date;
    end_time: Date;
    time_slots?: ITimeSlot;
    days_of_week: number[];
    status: SlotStatus | string;
    created_at: Date;
    updated_at: Date;
} 