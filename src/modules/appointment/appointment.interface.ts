import { Document, Schema } from 'mongoose';
import { AppointmentStatusEnum, CollectionMethodEnum } from './appointment.enum';

export type AppointmentStatus =
    AppointmentStatusEnum.PENDING |
    AppointmentStatusEnum.CONFIRMED |
    AppointmentStatusEnum.SAMPLE_COLLECTED |
    AppointmentStatusEnum.SAMPLE_RECEIVED |
    AppointmentStatusEnum.TESTING |
    AppointmentStatusEnum.COMPLETED |
    AppointmentStatusEnum.CANCELLED;

export type CollectionMethod =
    CollectionMethodEnum.SELF |
    CollectionMethodEnum.FACILITY |
    CollectionMethodEnum.HOME;

export interface IFeedback {
    rating: number;
    comment: string;
    created_at: Date;
    updated_at: Date;
}

export interface IAppointment extends Document {
    _id: string;
    user_id: Schema.Types.ObjectId;
    service_id: Schema.Types.ObjectId;
    status: AppointmentStatus;
    appointment_date: Date;
    collection_method: CollectionMethod;
    collection_address?: string;
    staff_id?: Schema.Types.ObjectId;
    slot_id?: Schema.Types.ObjectId;
    feedback?: IFeedback;
    created_at: Date;
    updated_at: Date;
}