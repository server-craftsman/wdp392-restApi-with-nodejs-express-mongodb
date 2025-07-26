export enum AppointmentStatusEnum {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SAMPLE_ASSIGNED = 'sample_assigned',
    SAMPLE_COLLECTED = 'sample_collected',
    SAMPLE_RECEIVED = 'sample_received',
    TESTING = 'testing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    // Trạng thái cho pháp lý
    AWAITING_AUTHORIZATION = 'awaiting_authorization', // Chờ cơ quan phê duyệt
    AUTHORIZED = 'authorized', // Đã được phê duyệt
    READY_FOR_COLLECTION = 'ready_for_collection', // Sẵn sàng lấy mẫu
    // Trạng thái cho đặt giữ chỗ
    RESERVED = 'reserved', // Đã đặt giữ chỗ
    RESERVATION_EXPIRED = 'reservation_expired', // Hết hạn đặt giữ chỗ
    RESERVATION_CONFIRMED = 'reservation_confirmed', // Xác nhận đặt giữ chỗ
}

export enum TypeEnum {
    SELF = 'self',
    FACILITY = 'facility',
    HOME = 'home',
    ADMINISTRATIVE = 'administrative', // Loại appointment cho pháp lý
}

export enum PaymentStatusEnum {
    UNPAID = 'unpaid',
    PAID = 'paid',
    REFUNDED = 'refunded',
    FAILED = 'failed',
    GOVERNMENT_FUNDED = 'government_funded', // Được cơ quan thanh toán
}

export enum AppointmentPaymentStageEnum {
    UNPAID = 'unpaid', // chưa thanh toán gì
    DEPOSIT_PAID = 'deposit_paid', // đã đặt cọc
    PAID = 'paid', // đã thanh toán đủ
    GOVERNMENT_PAID = 'government_paid', // Cơ quan thanh toán
}

// Enum cho loại đặt giữ chỗ
export enum ReservationTypeEnum {
    ADMINISTRATIVE_SERVICE = 'administrative_service', // Đặt giữ chỗ cho dịch vụ hành chính thông thường
    CIVIL_SERVICE = 'civil_service', // Đặt giữ chỗ cho dịch vụ dân sự
    REGULAR_SERVICE = 'regular_service', // Đặt giữ chỗ cho dịch vụ thường
}

// Enum cho trạng thái đặt giữ chỗ
export enum ReservationStatusEnum {
    PENDING = 'pending', // Chờ xác nhận
    CONFIRMED = 'confirmed', // Đã xác nhận
    EXPIRED = 'expired', // Hết hạn
    CANCELLED = 'cancelled', // Đã hủy
    CONVERTED = 'converted', // Đã chuyển thành appointment
}

// Enum cho loại thanh toán đặt giữ chỗ
export enum ReservationPaymentTypeEnum {
    DEPOSIT = 'deposit', // Đặt cọc
    FULL_PAYMENT = 'full_payment', // Thanh toán toàn bộ
    PARTIAL_PAYMENT = 'partial_payment', // Thanh toán một phần
}

// Enum cho loại nhu cầu xét nghiệm
export enum TestingNeedEnum {
    PATERNITY = 'paternity', // Xác định cha con
    MATERNITY = 'maternity', // Xác định mẹ con
    SIBLING = 'sibling', // Xác định anh chị em
    KINSHIP = 'kinship', // Xác định họ hàng
    IMMIGRATION = 'immigration', // Nhập cư
    INHERITANCE = 'inheritance', // Thừa kế
    OTHER = 'other', // Khác
}
