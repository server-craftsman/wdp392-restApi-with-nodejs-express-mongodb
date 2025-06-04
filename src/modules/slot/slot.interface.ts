import { Document, Schema } from 'mongoose';
import { SlotStatusEnum } from './slot.enum';

export type SlotStatus =
    SlotStatusEnum.AVAILABLE |
    SlotStatusEnum.BOOKED |
    SlotStatusEnum.UNAVAILABLE;

export interface TimePoint {
    hour: number;
    minute: number;
}

export interface ITimeSlot {
    year: number;
    month: number;
    day: number;
    start_time: TimePoint;
    end_time: TimePoint;
}

export interface ISlot extends Document {
    _id: string;
    // service_id?: Schema.Types.ObjectId;
    staff_profile_ids: Schema.Types.ObjectId[] | string[];
    appointment_id?: Schema.Types.ObjectId;
    appointment_limit: number; //max appointment per slot
    time_slots?: ITimeSlot[];
    status: SlotStatus | string;
    created_at: Date;
    updated_at: Date;
} 