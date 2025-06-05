import { Schema } from 'mongoose';
import { AppointmentLogTypeEnum } from './appointment_log.enum';
import { CollectionType } from '../appointment/appointment.interface';

export interface IAppointmentLog extends Document {
    _id: string;
    customer_id: string | undefined;
    staff_id: string | undefined;
    laboratory_technician_id: string | undefined;
    appointment_id: string | undefined;
    old_status: AppointmentLogTypeEnum;
    new_status: AppointmentLogTypeEnum;
    type: CollectionType;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}
