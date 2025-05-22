import { Schema } from 'mongoose';
import { AppointmentLogTypeEnum } from './appointment_log.enum';
import { CollectionType } from '../appointment/appointment.interface';

export interface IAppointmentLog extends Document {
    _id: string;
    customer_id: Schema.Types.ObjectId;
    staff_id: Schema.Types.ObjectId;
    laboratory_technician_id: Schema.Types.ObjectId;
    appointment_id: Schema.Types.ObjectId;
    old_status: AppointmentLogTypeEnum;
    new_status: AppointmentLogTypeEnum;
    type: CollectionType;
    created_at: Date;
    updated_at: Date;
}
