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
