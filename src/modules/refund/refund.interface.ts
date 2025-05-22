import { Document, Schema } from 'mongoose';
import { RefundMethodEnum, RefundStatusEnum } from './refund.enum';

export type RefundStatus =
    RefundStatusEnum.PENDING |
    RefundStatusEnum.APPROVED |
    RefundStatusEnum.REJECTED |
    RefundStatusEnum.COMPLETED;

export type RefundMethod =
    RefundMethodEnum.CASH |
    RefundMethodEnum.BANK_TRANSFER |
    RefundMethodEnum.OTHER;

export interface IRefund extends Document {
    _id: string;
    payment_id: Schema.Types.ObjectId;
    requester_id: Schema.Types.ObjectId;
    approver_id?: Schema.Types.ObjectId;
    amount: number;
    reason: string;
    status: RefundStatus;
    refund_method: RefundMethod;
    refund_transaction_id?: string;
    refund_date?: Date;
    created_at: Date;
    updated_at: Date;
} 