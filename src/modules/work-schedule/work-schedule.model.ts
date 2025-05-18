import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { ScheduleTypes } from './work-schedule.constant';
import { IWorkSchedule } from './work-schedule.interface';

const WorkScheduleSchemaEntity: Schema<IWorkSchedule> = new Schema({
    staff_profile_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.STAFF_PROFILE, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    type: {
        type: String,
        enum: ScheduleTypes,
        required: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const WorkScheduleSchema = mongoose.model<IWorkSchedule & mongoose.Document>(
    COLLECTION_NAME.WORK_SCHEDULE,
    WorkScheduleSchemaEntity
);

export default WorkScheduleSchema; 