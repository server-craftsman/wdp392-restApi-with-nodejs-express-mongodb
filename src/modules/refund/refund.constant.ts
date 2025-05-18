import { RefundMethodEnum, RefundStatusEnum } from './refund.enum';

export const RefundStatuses = [
    '',
    RefundStatusEnum.PENDING,
    RefundStatusEnum.APPROVED,
    RefundStatusEnum.REJECTED,
    RefundStatusEnum.COMPLETED
];

export const RefundMethods = [
    '',
    RefundMethodEnum.CASH,
    RefundMethodEnum.VNPAY,
    RefundMethodEnum.BANK_TRANSFER
]; 