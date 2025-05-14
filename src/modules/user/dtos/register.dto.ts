import { IsBoolean, IsDate, IsEmail, IsIn, IsNotEmpty, MinLength } from 'class-validator';
import { UserRoles } from '../user.constant';
import { UserRole } from '../user.interface';
import { UserRoleEnum } from './../user.enum';

export default class RegisterDto {
    constructor(
        google_id: string = '',
        name: string,
        email: string,
        password: string,
        role: UserRole = UserRoleEnum.STUDENT,
        status: boolean = true,
        description: string = '',
        phone_number: string = '',
        avatar_url: string = '',
        video_url: string = '',
        bank_name: string = '',
        bank_account_no: string = '',
        bank_account_name: string = '',
        dob: Date = new Date(),

        is_verified: boolean = false,
        verification_token: string = '',
        verification_token_expires: Date = new Date(),
        token_version: number = 0,

        created_at: Date = new Date(),
        updated_at: Date = new Date(),
        is_deleted: boolean = false,
    ) {
        this.google_id = google_id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.status = status;
        this.description = description;
        this.phone_number = phone_number;
        this.avatar_url = avatar_url;
        this.video_url = video_url;
        this.bank_name = bank_name;
        this.bank_account_no = bank_account_no;
        this.bank_account_name = bank_account_name;
        this.dob = dob;

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
    public name: string;

    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @IsNotEmpty()
    @MinLength(6)
    public password: string;

    @IsIn(UserRoles)
    public role: UserRole;

    @IsBoolean()
    public status: boolean;

    public description: string;
    public phone_number: string;
    public avatar_url: string;
    public video_url: string;
    public bank_name: string;
    public bank_account_no: string;
    public bank_account_name: string;

    @IsDate()
    public dob: Date;

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
