import { Document, Schema } from 'mongoose';
import { AttendanceStatusEnum } from './attendance.enum';

export type AttendanceStatus =
    AttendanceStatusEnum.PRESENT |
    AttendanceStatusEnum.ABSENT |
    AttendanceStatusEnum.LATE |
    AttendanceStatusEnum.LEAVE;

export interface IAttendance extends Document {
    _id: string;
    staff_profile_id: Schema.Types.ObjectId;
    date: Date;
    check_in?: Date;
    check_out?: Date;
    status: AttendanceStatus;
    notes?: string;
    created_at: Date;
    updated_at: Date;
} 