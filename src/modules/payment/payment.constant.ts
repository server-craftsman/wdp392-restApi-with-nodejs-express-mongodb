import { PaymentMethodEnum, PaymentStatusEnum } from './payment.enum';

export const PaymentMethods = [
    '',
    PaymentMethodEnum.CASH,
    PaymentMethodEnum.PAYOS
];

export const PaymentStatuses = [
    '',
    PaymentStatusEnum.PENDING,
    PaymentStatusEnum.COMPLETED,
    PaymentStatusEnum.FAILED,
    PaymentStatusEnum.CANCELLED
]; 