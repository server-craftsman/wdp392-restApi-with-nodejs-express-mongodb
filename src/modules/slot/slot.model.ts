import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { SlotStatuses } from './slot.constant';
import { ISlot, SlotPattern } from './slot.interface';
import type { ITimeSlot } from './slot.interface';

const TimeSlotSchema: Schema<ITimeSlot> = new Schema({
    start_hour: { type: Number, required: true },
    start_minute: { type: Number, required: true },
    end_hour: { type: Number, required: true },
    end_minute: { type: Number, required: true }
});

const SlotSchemaEntity: Schema<ISlot> = new Schema({
    staff_profile_ids: { type: [Schema.Types.ObjectId], ref: COLLECTION_NAME.STAFF_PROFILE, required: true },
    appointment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT },
    appointment_limit: { type: Number, required: true, default: 1 },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    // time_slots: { type: [TimeSlotSchema], required: true },
    days_of_week: { type: [Number], required: true },
    status: {
        type: String,
        enum: SlotStatuses,
        required: true
    },
    pattern: {
        type: String,
        enum: SlotPattern,
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