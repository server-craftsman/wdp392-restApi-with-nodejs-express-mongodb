import { Document } from 'mongoose';
import { UserReviewStatusEnum, UserRoleEnum } from './user.enum';

export type UserRole = UserRoleEnum.ADMIN | UserRoleEnum.CUSTOMER | UserRoleEnum.STAFF | UserRoleEnum.MANAGER | UserRoleEnum.ALL;
export type UserReviewStatus = UserReviewStatusEnum.APPROVE | UserReviewStatusEnum.REJECT;

export interface IUser extends Document {
    _id: string;
    first_name: string; // required
    last_name: string; // required
    email: string; // unique
    google_id?: string; // default empty
    password?: string; // required if google_id is null or empty
    role: UserRole; // default is "student"
    status: boolean; // default is true, set false if want disabled user status
    phone_number?: string; // default empty
    avatar_url?: string; // url
    dob?: Date; // date of birth, default new Date()

    // check verify
    is_verified?: boolean; // default false,
    verification_token?: string; // default empty
    verification_token_expires?: Date; // default new Date()
    token_version: number; // default 0

    // check balance
    // balance: number; // default 0,
    // balance_total?: number; // total balance get all course history
    // withdrawn_amount?: number; // amount user had withdrawn
    // bank_name?: string;
    // bank_account_no?: string;
    // bank_account_name?: string;

    // info transactions
    // transactions?: IUserTransaction[];

    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic when user is deleted, default is false
}

export interface IUserTransaction {
    payout_id: string; // required, reference to Purchase model
    payout_no: string;
    payout_amount: number;
}
