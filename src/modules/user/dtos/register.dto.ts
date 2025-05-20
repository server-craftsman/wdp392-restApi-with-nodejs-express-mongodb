import { IsBoolean, IsDate, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRoles } from '../user.constant';
import { UserRole } from '../user.interface';
import { UserRoleEnum } from './../user.enum';

export default class RegisterDto {
    constructor(
        google_id: string = '',
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        role: UserRole = UserRoleEnum.CUSTOMER,
        status: boolean = true,
        phone_number: string = '',
        avatar_url: string = '',
        dob: Date = new Date(),
        address: string = '',
        gender: string = '',

        is_verified: boolean = false,
        verification_token: string = '',
        verification_token_expires: Date = new Date(),
        token_version: number = 0,

        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.google_id = google_id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.status = status;
        this.phone_number = phone_number;
        this.avatar_url = avatar_url;
        this.dob = dob;
        this.address = address;
        this.gender = gender;
        this.is_verified = is_verified;
        this.verification_token = verification_token;
        this.verification_token_expires = verification_token_expires;
        this.token_version = token_version;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_deleted = is_deleted;
    }

    public google_id: string;

    @IsNotEmpty()
    public first_name: string;

    @IsNotEmpty()
    public last_name: string;

    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @IsNotEmpty()
    @MinLength(6)
    public password: string;

    @IsIn(UserRoles)
    @IsOptional()
    public role: UserRole;

    @IsBoolean()
    public status: boolean;

    @IsNotEmpty()
    public phone_number: string;

    @IsOptional()
    public avatar_url: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    public dob: Date;

    @IsString()
    @IsOptional()
    public address: string;

    @IsString()
    @IsOptional()
    public gender: string

    public is_verified: boolean;
    public verification_token: string;
    public verification_token_expires: Date;
    public token_version: number;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;

    @IsBoolean()
    public is_deleted: boolean;
}
