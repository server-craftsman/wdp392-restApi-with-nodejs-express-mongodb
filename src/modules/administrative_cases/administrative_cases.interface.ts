import { Document } from 'mongoose';
import { AdministrativeCaseStatus, AdministrativeCaseType, CaseUrgency } from './administrative_cases.enum';

export type AdministrativeCaseStatusType =
    AdministrativeCaseStatus.DRAFT |
    AdministrativeCaseStatus.SUBMITTED |
    AdministrativeCaseStatus.UNDER_REVIEW |
    AdministrativeCaseStatus.APPROVED |
    AdministrativeCaseStatus.DENIED |
    AdministrativeCaseStatus.SCHEDULED |
    AdministrativeCaseStatus.IN_PROGRESS |
    AdministrativeCaseStatus.COMPLETED |
    AdministrativeCaseStatus.RESULT_ISSUED |
    AdministrativeCaseStatus.ARCHIVED;

export type AdministrativeCaseTypeType =
    AdministrativeCaseType.PATERNITY |
    AdministrativeCaseType.MATERNITY |
    AdministrativeCaseType.SIBLING |
    AdministrativeCaseType.KINSHIP |
    AdministrativeCaseType.IMMIGRATION |
    AdministrativeCaseType.INHERITANCE |
    AdministrativeCaseType.CRIMINAL_CASE |
    AdministrativeCaseType.CIVIL_CASE |
    AdministrativeCaseType.MISSING_PERSON;

export type CaseUrgencyType =
    CaseUrgency.LOW |
    CaseUrgency.NORMAL |
    CaseUrgency.HIGH |
    CaseUrgency.URGENT;

// Thông tin người tham gia xét nghiệm
export interface ICaseParticipant {
    name: string;
    relationship: string; // Mối quan hệ với case (cha, mẹ, con, etc.)
    id_number?: string; // CCCD/CMND
    phone?: string;
    email?: string;
    address?: string;
    is_required: boolean; // Bắt buộc tham gia hay không
    consent_provided: boolean; // Đã đồng ý tham gia chưa
    sample_collected: boolean; // Đã lấy mẫu chưa
}

// Hồ sơ pháp lý đính kèm
export interface ICaseDocument {
    name: string;
    type: string; // 'court_order', 'authorization_letter', 'identity_proof', etc.
    file_url: string;
    uploaded_at: Date;
    verified: boolean;
}

export interface IAdministrativeCase extends Document {
    _id: string;

    // Thông tin cơ bản của case
    case_number: string; // Số hồ sơ (auto generate hoặc từ cơ quan)
    case_type: AdministrativeCaseTypeType; // Loại case
    urgency: CaseUrgencyType; // Mức độ khẩn cấp

    // Thông tin cơ quan yêu cầu
    requesting_agency: string; // Tên cơ quan (Tòa án, Công an, etc.)
    agency_address: string;
    agency_contact_name: string;
    agency_contact_email: string;
    agency_contact_phone: string;

    // Mã phê duyệt và giấy tờ
    authorization_code?: string; // Số phép (có sau khi được phê duyệt)
    court_order_number?: string; // Số quyết định tòa án (nếu có)
    authorization_date?: Date; // Ngày phê duyệt

    // Mô tả case
    case_description: string; // Mô tả chi tiết vụ việc
    legal_purpose: string; // Mục đích pháp lý
    expected_participants: number; // Số người dự kiến tham gia

    // Người tham gia
    participants: ICaseParticipant[]; // Danh sách người tham gia

    // Hồ sơ đính kèm
    documents: ICaseDocument[]; // Các giấy tờ đính kèm

    // Trạng thái và thời gian
    status: AdministrativeCaseStatusType;
    submitted_at?: Date; // Thời gian nộp hồ sơ
    reviewed_at?: Date; // Thời gian xem xét
    approved_at?: Date; // Thời gian phê duyệt
    scheduled_at?: Date; // Thời gian đặt lịch
    completed_at?: Date; // Thời gian hoàn thành

    // Lịch hẹn liên kết
    appointment_ids: string[]; // Có thể có nhiều lịch hẹn cho 1 case

    // Ghi chú và phản hồi
    agency_notes?: string; // Ghi chú từ cơ quan
    internal_notes?: string; // Ghi chú nội bộ
    denial_reason?: string; // Lý do từ chối (nếu bị deny)

    // Người tạo và quản lý
    created_by_user_id: string; // User tạo case (thường là staff/admin)
    assigned_staff_id?: string; // Staff được phân công xử lý

    // Thông tin kết quả
    result_delivery_method?: 'pickup' | 'mail' | 'email'; // Cách giao kết quả
    result_recipient?: string; // Người nhận kết quả
    result_delivered_at?: Date; // Thời gian giao kết quả

    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}