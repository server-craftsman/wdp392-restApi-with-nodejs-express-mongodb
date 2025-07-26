import { Document } from 'mongoose';

export interface IResult extends Document {
    _id: string;
    appointment_id: string | undefined;
    customer_id: string | undefined;
    sample_ids: string[] | undefined;
    result_data?: any;
    is_match?: boolean;
    laboratory_technician_id: string | undefined;
    completed_at?: Date;
    report_url?: string;
    created_at: Date;
    updated_at: Date;
}

// Interface for certificate requests
export interface ICertificateRequest extends Document {
    _id: string;
    result_id: string; // ID của result
    customer_id: string; // Người yêu cầu
    request_count: number; // Số lần yêu cầu (1 = free, 2+ = paid)
    reason: string; // Lý do yêu cầu (mất giấy, cần bản copy, etc.)
    payment_id?: string; // ID payment nếu tính phí
    is_paid: boolean; // Đã thanh toán chưa (cho lần 2+)
    certificate_issued_at?: Date; // Ngày phát giấy
    status: 'pending' | 'processing' | 'issued' | 'rejected';
    agency_notes?: string; // Ghi chú từ cơ quan thẩm quyền
    created_at: Date;
    updated_at: Date;
} 