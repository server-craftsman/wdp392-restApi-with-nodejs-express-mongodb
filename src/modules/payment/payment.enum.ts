export enum PaymentMethodEnum {
    PAYOS = 'payos',
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    GOVERNMENT = 'government', // For administrative cases
}

export enum PaymentTypeEnum {
    APPOINTMENT_DEPOSIT = 'appointment_deposit',
    APPOINTMENT_REMAINING = 'appointment_remaining',
    SAMPLE_COLLECTION = 'sample_collection',
    RESULT_CERTIFICATE = 'result_certificate', // Phí phát giấy kết quả lần 2+
    // Thanh toán cho đặt giữ chỗ
    RESERVATION_DEPOSIT = 'reservation_deposit', // Đặt cọc đặt giữ chỗ
    RESERVATION_FULL_PAYMENT = 'reservation_full_payment', // Thanh toán toàn bộ đặt giữ chỗ
    RESERVATION_REMAINING = 'reservation_remaining', // Thanh toán phần còn lại
    ADMINISTRATIVE_CASE_PAYMENT = 'administrative_case_payment', // Thanh toán vụ việc hành chính
}

export enum PaymentStatusEnum {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export enum PaymentStageEnum {
    DEPOSIT = 'deposit',
    REMAINING = 'remaining',
}

// Enum cho loại thanh toán đặt giữ chỗ
export enum ReservationPaymentStageEnum {
    DEPOSIT_ONLY = 'deposit_only', // Chỉ đặt cọc
    FULL_PAYMENT = 'full_payment', // Thanh toán toàn bộ
    PARTIAL_PAYMENT = 'partial_payment', // Thanh toán một phần
    REMAINING_PAYMENT = 'remaining_payment', // Thanh toán phần còn lại
}

// Enum cho phương thức thanh toán đặt giữ chỗ
export enum ReservationPaymentMethodEnum {
    PAYOS = 'payos',
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
}
