import mongoose, { Schema, Document } from 'mongoose';
import { ConsultationStatusEnum } from './consultation.interface';
import { TypeEnum } from './appointment.enum';

interface IConsultationDocument extends Document {
    // Thông tin khách hàng
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

    // Trạng thái và assignment
    consultation_status: ConsultationStatusEnum;
    assigned_consultant_id?: string;

    // Thông tin meeting
    meeting_link?: string;
    meeting_notes?: string;
    follow_up_required?: boolean;
    follow_up_date?: Date;

    // Thông tin thời gian
    appointment_date?: Date;
    created_at: Date;
    updated_at: Date;
}

const ConsultationSchema = new Schema<IConsultationDocument>(
    {
        // Thông tin khách hàng
        first_name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        last_name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone_number: {
            type: String,
            required: true,
            trim: true,
        },

        // Thông tin tư vấn
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        consultation_notes: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        preferred_date: {
            type: Date,
        },
        preferred_time: {
            type: String,
            trim: true,
            maxlength: 200,
        },

        // Loại tư vấn (HOME/FACILITY)
        type: {
            type: String,
            enum: Object.values(TypeEnum),
            required: true,
        },
        collection_address: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        // Trạng thái và assignment
        consultation_status: {
            type: String,
            enum: Object.values(ConsultationStatusEnum),
            default: ConsultationStatusEnum.REQUESTED,
        },
        assigned_consultant_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },

        // Thông tin meeting
        meeting_link: {
            type: String,
            trim: true,
        },
        meeting_notes: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        follow_up_required: {
            type: Boolean,
            default: false,
        },
        follow_up_date: {
            type: Date,
        },

        // Thông tin thời gian
        appointment_date: {
            type: Date,
            default: Date.now,
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
        updated_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'consultations',
    },
);

// Indexes
ConsultationSchema.index({ email: 1 });
ConsultationSchema.index({ consultation_status: 1 });
ConsultationSchema.index({ assigned_consultant_id: 1 });
ConsultationSchema.index({ created_at: -1 });

export default mongoose.model<IConsultationDocument>('Consultation', ConsultationSchema);
