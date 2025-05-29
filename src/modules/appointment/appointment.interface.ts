import { Document, Schema } from 'mongoose';
import { AppointmentStatusEnum, TypeEnum } from './appointment.enum';
import { ISample } from '../sample/sample.interface';

export type AppointmentStatus =
    AppointmentStatusEnum.PENDING |
    AppointmentStatusEnum.CONFIRMED |
    AppointmentStatusEnum.SAMPLE_COLLECTED |
    AppointmentStatusEnum.SAMPLE_RECEIVED |
    AppointmentStatusEnum.TESTING |
    AppointmentStatusEnum.COMPLETED |
    AppointmentStatusEnum.CANCELLED;

export type CollectionType =
    TypeEnum.SELF |
    TypeEnum.FACILITY |
    TypeEnum.HOME;

// Interface for sample information in appointment response
export interface ISampleInfo {
    _id: string;
    type: string;
    status: string;
    kit_id: Schema.Types.ObjectId;
}

export interface IAppointment extends Document {
    _id: string;
    user_id: Schema.Types.ObjectId;
    service_id: Schema.Types.ObjectId;
    status: AppointmentStatus;
    appointment_date: Date;
    type: CollectionType;
    collection_address?: string;
    staff_id?: Schema.Types.ObjectId;
    slot_id?: Schema.Types.ObjectId;
    samples?: ISampleInfo[];
    created_at: Date;
    updated_at: Date;
}