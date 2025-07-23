export enum PaymentMethodEnum {
    CASH = 'cash',
    PAY_OS = 'pay_os',
    GOVERNMENT = 'government'
}

export enum PaymentStatusEnum {
    PENDING = 'pending',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export enum PaymentStageEnum {
    DEPOSIT = 'deposit',
    REMAINING = 'remaining'
} 