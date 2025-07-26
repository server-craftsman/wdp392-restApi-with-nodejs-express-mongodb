import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IAdministrativeCase, ICaseParticipant, ICaseDocument } from './administrative_cases.interface';
import { AdministrativeCaseStatus, AdministrativeCaseType, CaseUrgency } from './administrative_cases.enum';

// Schema cho người tham gia
const ParticipantSchema = new Schema<ICaseParticipant>({
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    id_number: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    is_required: { type: Boolean, default: true },
    consent_provided: { type: Boolean, default: false },
    sample_collected: { type: Boolean, default: false }
});

// Schema cho tài liệu
const DocumentSchema = new Schema<ICaseDocument>({
    name: { type: String, required: true },
    type: { type: String, required: true },
    file_url: { type: String, required: true },
    uploaded_at: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
});

const AdministrativeCaseSchemaEntity = new Schema<IAdministrativeCase>({
    case_number: { type: String, required: true, unique: true },
    case_type: {
        type: String,
        enum: Object.values(AdministrativeCaseType),
        required: true
    },
    urgency: {
        type: String,
        enum: Object.values(CaseUrgency),
        default: CaseUrgency.NORMAL
    },

    // Thông tin cơ quan
    requesting_agency: { type: String, required: true },
    agency_address: { type: String, required: true },
    agency_contact_name: { type: String, required: true },
    agency_contact_email: { type: String, required: true },
    agency_contact_phone: { type: String, required: true },

    // Mã phê duyệt
    authorization_code: { type: String },
    court_order_number: { type: String },
    authorization_date: { type: Date },

    // Mô tả
    case_description: { type: String, required: true },
    legal_purpose: { type: String, required: true },
    expected_participants: { type: Number, required: true },

    // Người tham gia và tài liệu
    participants: [ParticipantSchema],
    documents: [DocumentSchema],

    // Trạng thái
    status: {
        type: String,
        enum: Object.values(AdministrativeCaseStatus),
        default: AdministrativeCaseStatus.DRAFT
    },

    // Thời gian
    submitted_at: { type: Date },
    reviewed_at: { type: Date },
    approved_at: { type: Date },
    scheduled_at: { type: Date },
    completed_at: { type: Date },

    // Lịch hẹn
    appointment_ids: [{ type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT }],

    // Ghi chú
    agency_notes: { type: String },
    internal_notes: { type: String },
    denial_reason: { type: String },

    // Người quản lý
    created_by_user_id: { type: String, ref: COLLECTION_NAME.USER, required: true },
    assigned_staff_id: { type: String, ref: COLLECTION_NAME.USER },

    // Kết quả
    result_delivery_method: {
        type: String,
        enum: ['pickup', 'mail', 'email']
    },
    result_recipient: { type: String },
    result_delivered_at: { type: Date },

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false }
});

const AdministrativeCaseSchema = mongoose.model<IAdministrativeCase>(
    COLLECTION_NAME.ADMINISTRATIVE_CASE,
    AdministrativeCaseSchemaEntity
);

export default AdministrativeCaseSchema;

