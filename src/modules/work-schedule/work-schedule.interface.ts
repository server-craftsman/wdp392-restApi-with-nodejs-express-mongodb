import { Document, Schema } from 'mongoose';
import { ScheduleTypeEnum } from './work-schedule.enum';

export type ScheduleType =
    ScheduleTypeEnum.SHIFT |
    ScheduleTypeEnum.ON_CALL |
    ScheduleTypeEnum.OFF;

export interface IWorkSchedule extends Document {
    _id: string;
    staff_profile_id: Schema.Types.ObjectId;
    start_time: Date;
    end_time: Date;
    type: ScheduleType;
    created_at: Date;
    updated_at: Date;
} 