import { Document } from 'mongoose';
import { AppointmentStatusEnum, TypeEnum, PaymentStatusEnum } from './appointment.enum';
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
    kit_id: string;
}

export interface IAppointment extends Document {
    _id: string;
    user_id: string | undefined;
    service_id: string | undefined;
    slot_id?: string | undefined;
    staff_id?: string | undefined;
    laboratory_technician_id?: string | undefined;
    agency_contact_email?: string;
    email?: string;
    appointment_date: Date;
    type: TypeEnum;
    collection_address?: string;
    status: AppointmentStatusEnum;
    payment_status: PaymentStatusEnum;
    administrative_case_id?: string | any;
    created_at: Date;
    updated_at: Date;
}