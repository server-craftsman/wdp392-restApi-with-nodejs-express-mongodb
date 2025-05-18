import { PaymentMethodEnum, PaymentStatusEnum } from './payment.enum';

export const PaymentMethods = [
    '',
    PaymentMethodEnum.CASH,
    PaymentMethodEnum.VNPAY
];

export const PaymentStatuses = [
    '',
    PaymentStatusEnum.PENDING,
    PaymentStatusEnum.COMPLETED,
    PaymentStatusEnum.FAILED,
    PaymentStatusEnum.REFUNDED
]; 