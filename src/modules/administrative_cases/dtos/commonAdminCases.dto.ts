import { IsString, IsEmail, IsOptional, Matches, IsEnum } from 'class-validator';
import { AdministrativeCaseStatus } from '../administrative_cases.enum';

export class CreateAdministrativeCaseDto {
    @IsString()
    // Format: AC-YYYYMMDD-XXXX (AC = Administrative Case, date, 4 số)
    @Matches(/^AC-\d{8}-\d{4}$/, {
        message: 'case_number must be in format AC-YYYYMMDD-XXXX (e.g., AC-20240601-0001)'
    })
    case_number!: string;

    @IsString()
    // Format: AUTH-XXXXXX (AUTH = Authorization, 6 ký tự chữ/số)
    @Matches(/^AUTH-[A-Z0-9]{6}$/, {
        message: 'authorization_code must be in format AUTH-XXXXXX (e.g., AUTH-1A2B3C)'
    })
    authorization_code!: string;

    @IsEmail()
    agency_contact_email!: string;

    @IsString()
    agency_contact_name!: string;

    @IsString()
    agency_contact_phone!: string;

    @IsString()
    applicant_name!: string;

    @IsEmail()
    applicant_email!: string;

    @IsString()
    applicant_id!: string;

    @IsOptional()
    created_at?: Date;

    @IsOptional()
    updated_at?: Date;

    @IsOptional()
    @IsEnum(AdministrativeCaseStatus)
    status?: AdministrativeCaseStatus;

    @IsOptional()
    is_deleted?: boolean;
}
