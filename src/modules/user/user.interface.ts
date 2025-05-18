import { Document } from 'mongoose';
import { UserReviewStatusEnum, UserRoleEnum, UserGenderEnum, UserStatusEnum } from './user.enum';

export type UserRole = UserRoleEnum.ADMIN | UserRoleEnum.CUSTOMER | UserRoleEnum.STAFF | UserRoleEnum.MANAGER | UserRoleEnum.ALL;
export type UserReviewStatus = UserReviewStatusEnum.APPROVE | UserReviewStatusEnum.REJECT;
export type UserGender = UserGenderEnum.MALE | UserGenderEnum.FEMALE | UserGenderEnum.OTHER;
export type UserStatus = UserStatusEnum.ACTIVE | UserStatusEnum.INACTIVE | UserStatusEnum.SUSPENDED;

export interface IUser extends Document {
    _id: string;
    first_name: string; // required
    last_name: string; // required
    gender: UserGender; // male, female, other
    email: string; // unique
    phone_number: string; // unique
    password?: string; // required if google_id is null or empty
    dob?: Date; // date of birth
    role: UserRole; // default is "client"
    status: boolean; // active, inactive, suspended
    is_verified?: boolean; // default false
    verification_token?: string; // default empty
    verification_token_expires?: Date; // default new Date()
    token_version: number; // default 0
    google_id?: string; // default empty
    avatar_url?: string; // url
    address?: string; // address

    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic when user is deleted, default is false
}

export interface IUserTransaction {
    payout_id: string; // required, reference to Purchase model
    payout_no: string;
    payout_amount: number;
}
