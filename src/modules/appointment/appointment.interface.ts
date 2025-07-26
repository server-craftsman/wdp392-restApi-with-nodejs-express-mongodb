import { Document } from 'mongoose';
import { AppointmentStatusEnum, TypeEnum, PaymentStatusEnum, AppointmentPaymentStageEnum, ReservationTypeEnum, ReservationStatusEnum, ReservationPaymentTypeEnum, TestingNeedEnum } from './appointment.enum';
import { ISample } from '../sample/sample.interface';
import { PaymentTypeEnum } from '../payment/payment.enum';

export type AppointmentStatus =
    | AppointmentStatusEnum.PENDING
    | AppointmentStatusEnum.CONFIRMED
    | AppointmentStatusEnum.SAMPLE_COLLECTED
    | AppointmentStatusEnum.SAMPLE_RECEIVED
    | AppointmentStatusEnum.TESTING
    | AppointmentStatusEnum.COMPLETED
    | AppointmentStatusEnum.CANCELLED;

export type CollectionType = TypeEnum.SELF | TypeEnum.FACILITY | TypeEnum.HOME;

export type AppointmentPaymentStage = AppointmentPaymentStageEnum.UNPAID | AppointmentPaymentStageEnum.DEPOSIT_PAID | AppointmentPaymentStageEnum.PAID;

// Interface for sample information in appointment response
export interface ISampleInfo {
    _id: string;
    type: string;
    status: string;
    kit_id: string;
}

export interface ICheckinLog {
    staff_id: string | undefined;
    time: Date | undefined;
    note?: string | undefined;
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
    total_amount?: number;
    deposit_amount?: number;
    amount_paid?: number;
    payment_stage?: AppointmentPaymentStage;
    administrative_case_id?: string | any;
    // Add at the end of IAppointment
    checkin_logs?: ICheckinLog[];
    notes?: string[];
    created_at: Date;
    updated_at: Date;
}

// Interface for payment history in reservation
export interface IReservationPaymentHistory {
    payment_id: string;
    amount: number;
    payment_date: Date;
    payment_method: PaymentTypeEnum;
    status: PaymentStatusEnum;
}

// Interface for Reservation
export interface IReservation extends Document {
    _id: string;
    user_id: string;
    service_id: string;
    reservation_type: ReservationTypeEnum;
    testing_need: TestingNeedEnum; // Loại nhu cầu xét nghiệm
    status: ReservationStatusEnum;
    payment_status: PaymentStatusEnum;
    payment_type: ReservationPaymentTypeEnum;
    total_amount: number;
    deposit_amount: number;
    amount_paid: number;
    remaining_amount?: number;
    preferred_appointment_date?: Date;
    preferred_time_slots?: string[];
    collection_type: TypeEnum;
    collection_address?: string;
    contact_phone: number;
    contact_email: string;
    special_requirements?: string;
    notes?: string[];
    reservation_expires_at: Date;
    converted_to_appointment_id?: string;
    payment_history: IReservationPaymentHistory[];
    created_at: Date;
    updated_at: Date;
}

// Interface for creating a reservation
export interface ICreateReservationRequest {
    service_id: string;
    testing_need: TestingNeedEnum;
    total_amount?: number;
    deposit_amount?: number;
    preferred_appointment_date?: Date;
    preferred_time_slots?: string[];
    collection_type?: TypeEnum;
    collection_address?: string;
    contact_phone: number;
    contact_email: string;
    special_requirements?: string;
    notes?: string[];
}

// Interface for updating a reservation
export interface IUpdateReservationRequest {
    preferred_appointment_date?: Date;
    preferred_time_slots?: string[];
    collection_type?: TypeEnum;
    collection_address?: string;
    contact_phone?: number;
    contact_email?: string;
    special_requirements?: string;
    notes?: string[];
}

// Interface for reservation payment
export interface IReservationPaymentRequest {
    reservation_id: string;
    payment_type: ReservationPaymentTypeEnum;
    amount: number;
    payment_method: PaymentTypeEnum;
    payment_reference?: string;
}
