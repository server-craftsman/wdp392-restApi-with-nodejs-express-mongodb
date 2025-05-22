import { PaymentMethodEnum, PaymentStatusEnum } from './payment.enum';

export const PaymentMethods = [
    '',
    PaymentMethodEnum.CASH,
    PaymentMethodEnum.PAY_OS
];

export const PaymentStatuses = [
    '',
    PaymentStatusEnum.PENDING,
    PaymentStatusEnum.COMPLETED,
    PaymentStatusEnum.FAILED,
    PaymentStatusEnum.REFUNDED
]; 