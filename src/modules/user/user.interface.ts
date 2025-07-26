import { Document } from 'mongoose';
import { UserReviewStatusEnum, UserRoleEnum, UserGenderEnum } from './user.enum';
export type UserRole = UserRoleEnum.ADMIN | UserRoleEnum.CUSTOMER | UserRoleEnum.STAFF | UserRoleEnum.MANAGER | UserRoleEnum.ALL | UserRoleEnum.LABORATORY_TECHNICIAN;
export type UserReviewStatus = UserReviewStatusEnum.APPROVE | UserReviewStatusEnum.REJECT;
export type UserGender = UserGenderEnum.MALE | UserGenderEnum.FEMALE | UserGenderEnum.OTHER;

export interface IAddress {
    street: string;         // Số nhà, tên đường
    ward: string;           // Phường/Xã
    district: string;       // Quận/Huyện
    city: string;           // Tỉnh/Thành phố
    country: string;        // Quốc gia (mặc định: 'Việt Nam')
}

export interface IUser extends Document {
    _id: string;
    first_name: string; // required
    last_name: string; // required
    gender: UserGender; // male, female, other
    email: string; // unique
    phone_number: number; // unique
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
    address?: IAddress; // default empty address object

    // bank account info
    balance: number; // default 0
    balance_total: number; // default 0
    withdrawn_amount: number; // default 0
    bank_name: string; // default empty
    bank_account_no: string; // default empty
    bank_account_name: string; // default empty

    created_at?: Date; // default new Date()
    updated_at?: Date; // default new Date()
    is_deleted?: boolean; // flag remove logic when user is deleted, default is false


    // citizen id
    citizen_id?: string;
    citizen_id_url?: string;
    birth_certificate?: string; // giấy khai sinh
    divorce_certificate?: string; // giấy ly hôn

    full_name?: string;
    phone?: string;
    administrative_cases?: any[];
}