import mongoose, { Schema } from 'mongoose';
import { AppointmentLogTypeEnum } from './appointment_log.enum';
import { IAppointmentLog } from './appointment_log.interface';
import { CollectionTypes } from '../appointment';
import { COLLECTION_NAME } from '../../core/constants';

const AppointmentLogSchema = new Schema({
    appointment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT },
    customer_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
    staff_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
    laboratory_technician_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
    old_status: { type: String, enum: AppointmentLogTypeEnum },
    new_status: { type: String, enum: AppointmentLogTypeEnum },
    type: { type: String, enum: CollectionTypes },
    notes: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const AppointmentLog = mongoose.model<IAppointmentLog>(COLLECTION_NAME.APPOINTMENT_LOG, AppointmentLogSchema);

export default AppointmentLog;  
