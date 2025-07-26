export enum PaymentMethodEnum {
    PAYOS = 'payos',
    CASH = 'cash',
    BANK_TRANSFER = 'bank_transfer',
    GOVERNMENT = 'government' // For administrative cases
}

export enum PaymentTypeEnum {
    APPOINTMENT_DEPOSIT = 'appointment_deposit',
    APPOINTMENT_REMAINING = 'appointment_remaining',
    SAMPLE_COLLECTION = 'sample_collection',
    RESULT_CERTIFICATE = 'result_certificate' // Phí phát giấy kết quả lần 2+
}

export enum PaymentStatusEnum {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export enum PaymentStageEnum {
    DEPOSIT = 'deposit',
    REMAINING = 'remaining'
} 