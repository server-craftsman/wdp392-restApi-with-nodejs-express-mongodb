import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { SlotStatuses } from './slot.constant';
import { ISlot } from './slot.interface';
import type { ITimeSlot, TimePoint } from './slot.interface';

const TimePointSchema: Schema<TimePoint> = new Schema({
    hour: { type: Number, required: true },
    minute: { type: Number, required: true }
}, { _id: false });

const TimeSlotSchema: Schema<ITimeSlot> = new Schema({
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    day: { type: Number, required: true },
    start_time: { type: TimePointSchema, required: true },
    end_time: { type: TimePointSchema, required: true }
});

const SlotSchemaEntity: Schema<ISlot> = new Schema({
    staff_profile_ids: { type: [Schema.Types.ObjectId], ref: COLLECTION_NAME.STAFF_PROFILE, required: true },
    appointment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT },
    appointment_limit: { type: Number, required: true, default: 1 },
    time_slots: { type: [TimeSlotSchema], required: true },
    status: {
        type: String,
        enum: SlotStatuses,
        required: true
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const SlotSchema = mongoose.model<ISlot & mongoose.Document>(
    COLLECTION_NAME.SLOT,
    SlotSchemaEntity
);

export default SlotSchema; 