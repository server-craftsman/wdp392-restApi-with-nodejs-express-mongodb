import { Document } from 'mongoose';
import { AdministrativeCaseStatus } from './administrative_cases.enum';

export type AdministrativeCaseStatusType =
    AdministrativeCaseStatus.PENDING |
    AdministrativeCaseStatus.APPROVED |
    AdministrativeCaseStatus.DENIED;

export interface IAdministrativeCase extends Document {
    id: string;

    // Đây là một định danh duy nhất cho các trường hợp xét nghiệm DNA hành chính, 
    // thường được cơ quan chính phủ cấp để theo dõi, 
    // chẳng hạn như trong các trường hợp nhập cư . 
    // Nó giúp liên kết cuộc hẹn với một vụ việc cụ thể.
    case_number: string;

    // Đây là mã do cơ quan có thẩm quyền cung cấp để phê duyệt xét nghiệm DNA, 
    // đảm bảo rằng xét nghiệm được thực hiện hợp pháp . 
    // Nó đóng vai trò như một cơ chế xác minh.
    authorization_code: string; // số phép

    status: AdministrativeCaseStatusType;
    applicant_name: string;
    applicant_id: string;
    created_at: Date;
    updated_at: Date;
}