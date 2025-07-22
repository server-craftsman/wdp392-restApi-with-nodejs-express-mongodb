import { Document } from 'mongoose';
import { TypeEnum } from './appointment.enum';

export interface IConsultation extends Document {
    // Thông tin khách hàng (không cần đăng ký tài khoản)
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;

    // Thông tin tư vấn
    subject: string;
    consultation_notes?: string;
    preferred_date?: Date;
    preferred_time?: string;

    // Loại tư vấn
    type: TypeEnum;
    collection_address?: string;

    // Trạng thái tư vấn
    consultation_status: ConsultationStatusEnum;
    assigned_consultant_id?: string; // Staff được gán để tư vấn

    // Thông tin cuộc gọi/meeting
    meeting_link?: string;
    meeting_notes?: string;
    follow_up_required?: boolean;
    follow_up_date?: Date;

    // Thông tin thời gian
    appointment_date?: Date;
    created_at: Date;
    updated_at: Date;
}

export enum ConsultationStatusEnum {
    REQUESTED = 'REQUESTED',
    ASSIGNED = 'ASSIGNED',
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    FOLLOW_UP_REQUIRED = 'FOLLOW_UP_REQUIRED'
} 