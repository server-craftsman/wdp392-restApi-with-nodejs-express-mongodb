import { Document, Schema } from 'mongoose';
import { SlotStatusEnum } from './slot.enum';

export type SlotStatus = SlotStatusEnum.AVAILABLE | SlotStatusEnum.BOOKED | SlotStatusEnum.UNAVAILABLE;

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
    _id: string | undefined;
    service_id?: string | undefined;
    staff_profile_ids: string[] | undefined;
    appointment_id?: string | undefined;
    appointment_limit: number; //max appointment per slot
    assigned_count?: number; // current count of appointments assigned to this slot
    time_slots?: ITimeSlot[];
    status: SlotStatus | string;
    created_at: Date;
    updated_at: Date;
}
