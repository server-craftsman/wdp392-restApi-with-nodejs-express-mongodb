import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { AppointmentStatuses, CollectionTypes } from './appointment.constant';
import { IAppointment } from './appointment.interface';



const AppointmentSchemaEntity: Schema<IAppointment> = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    service_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SERVICE, required: true },
    status: {
        type: String,
        enum: AppointmentStatuses,
        required: true
    },
    appointment_date: { type: Date, required: true },
    type: {
        type: String,
        enum: CollectionTypes,
        required: true
    },
    collection_address: { type: String },
    staff_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
    slot_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SLOT },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const AppointmentSchema = mongoose.model<IAppointment & mongoose.Document>(
    COLLECTION_NAME.APPOINTMENT,
    AppointmentSchemaEntity
);

export default AppointmentSchema;
