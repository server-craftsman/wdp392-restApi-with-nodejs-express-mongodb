export enum AppointmentStatusEnum {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SAMPLE_COLLECTED = 'sample_collected',
    SAMPLE_RECEIVED = 'sample_received',
    TESTING = 'testing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum TypeEnum {
    SELF = 'self',
    FACILITY = 'facility',
    HOME = 'home'
}

export enum PaymentStatusEnum {
    UNPAID = 'unpaid',
    PAID = 'paid',
    REFUNDED = 'refunded',
    FAILED = 'failed'
} 