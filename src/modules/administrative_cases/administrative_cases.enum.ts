export enum AdministrativeCaseStatus {
    DRAFT = 'draft', // Case đang soạn thảo
    SUBMITTED = 'submitted', // Đã nộp hồ sơ, chờ cơ quan xem xét
    UNDER_REVIEW = 'under_review', // Cơ quan đang xem xét
    APPROVED = 'approved', // Được phê duyệt, có thể đặt lịch
    DENIED = 'denied', // Bị từ chối
    SCHEDULED = 'scheduled', // Đã đặt lịch thành công
    IN_PROGRESS = 'in_progress', // Đang thực hiện xét nghiệm
    COMPLETED = 'completed', // Hoàn thành xét nghiệm
    RESULT_ISSUED = 'result_issued', // Đã phát kết quả cho cơ quan
    ARCHIVED = 'archived', // Đã lưu trữ
}

export enum AdministrativeCaseType {
    PATERNITY = 'paternity', // Xác định cha con
    MATERNITY = 'maternity', // Xác định mẹ con
    SIBLING = 'sibling', // Xác định anh chị em
    KINSHIP = 'kinship', // Xác định họ hàng
    IMMIGRATION = 'immigration', // Nhập cư
    INHERITANCE = 'inheritance', // Thừa kế
    CRIMINAL_CASE = 'criminal_case', // Vụ án hình sự
    CIVIL_CASE = 'civil_case', // Vụ án dân sự
    MISSING_PERSON = 'missing_person', // Người mất tích
}

export enum CaseUrgency {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent',
}
