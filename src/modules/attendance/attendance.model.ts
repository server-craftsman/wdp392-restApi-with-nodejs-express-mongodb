import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { AttendanceStatuses } from './attendance.constant';
import { IAttendance } from './attendance.interface';

const AttendanceSchemaEntity: Schema<IAttendance> = new Schema({
    staff_profile_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.STAFF_PROFILE, required: true },
    date: { type: Date, required: true },
    check_in: { type: Date },
    check_out: { type: Date },
    status: {
        type: String,
        enum: AttendanceStatuses,
        required: true
    },
    notes: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const AttendanceSchema = mongoose.model<IAttendance & mongoose.Document>(
    COLLECTION_NAME.ATTENDANCE,
    AttendanceSchemaEntity
);

export default AttendanceSchema; 