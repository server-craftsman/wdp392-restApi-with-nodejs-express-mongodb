import { IsString, IsEmail, IsOptional, Matches, IsEnum, IsArray, IsNumber, IsBoolean, IsDate, ValidateNested, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AdministrativeCaseStatus, AdministrativeCaseType, CaseUrgency } from '../administrative_cases.enum';

export class ParticipantDto {
    @IsString()
    name!: string;

    @IsString()
    relationship!: string;

    @IsOptional()
    @IsString()
    id_number?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsBoolean()
    is_required?: boolean;

    @IsOptional()
    @IsBoolean()
    consent_provided?: boolean;

    @IsOptional()
    @IsBoolean()
    sample_collected?: boolean;
}

export class DocumentDto {
    @IsString()
    name!: string;

    @IsString()
    type!: string;

    @IsString()
    file_url!: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    uploaded_at?: Date;

    @IsOptional()
    @IsBoolean()
    verified?: boolean;
}

export class CreateAdministrativeCaseDto {
    @IsString()
    @IsOptional()
    // Format: PL-YYYY-XXX (PL = Pháp Lý, năm, 3 số)
    @Matches(/^PL-\d{4}-\d{3}$/, {
        message: 'case_number must be in format PL-YYYY-XXX (e.g., PL-2024-001)',
    })
    case_number!: string;

    @IsEnum(AdministrativeCaseType)
    case_type!: AdministrativeCaseType;

    @IsEnum(CaseUrgency)
    urgency!: CaseUrgency;

    @IsString()
    requesting_agency!: string;

    @IsString()
    agency_address!: string;

    @IsString()
    agency_contact_name!: string;

    @IsEmail()
    agency_contact_email!: string;

    @IsString()
    // Định dạng số điện thoại Việt Nam: 0xxxxxxxxx (10 số)
    @Matches(/^0\d{9}$/, {
        message: 'agency_contact_phone must be Vietnamese phone format: 0xxxxxxxxx (10 digits)',
    })
    agency_contact_phone!: string;

    @IsOptional()
    @IsString()
    // Format: QD-YYYY-XXX (Quyết Định - năm - số)
    @Matches(/^QD-\d{4}-\d{3}$/, {
        message: 'authorization_code must be in format QD-YYYY-XXX (e.g., QD-2024-001)',
    })
    authorization_code?: string;

    @IsOptional()
    @IsString()
    // Format: SO-XXX/YYYY (Số - số thứ tự / năm)
    @Matches(/^SO-\d{3}\/\d{4}$/, {
        message: 'court_order_number must be in format SO-XXX/YYYY (e.g., SO-001/2024)',
    })
    court_order_number?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    authorization_date?: Date;

    @IsString()
    case_description!: string;

    @IsString()
    legal_purpose!: string;

    @IsNumber()
    expected_participants!: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ParticipantDto)
    participants!: ParticipantDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DocumentDto)
    documents?: DocumentDto[];

    @IsOptional()
    @IsString()
    agency_notes?: string;

    @IsOptional()
    @IsString()
    internal_notes?: string;

    @IsOptional()
    @IsString()
    denial_reason?: string;

    @IsOptional()
    assigned_staff_id?: string | null;

    @IsOptional()
    @IsString()
    result_delivery_method?: 'pickup' | 'mail' | 'email';

    @IsOptional()
    @IsString()
    result_recipient?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    created_at?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    updated_at?: Date;

    @IsOptional()
    @IsEnum(AdministrativeCaseStatus)
    status?: AdministrativeCaseStatus;

    @IsOptional()
    @IsBoolean()
    is_deleted?: boolean;
}

export class UpdateAdministrativeCaseDto {
    @IsOptional()
    @IsEnum(AdministrativeCaseType)
    case_type?: AdministrativeCaseType;

    @IsOptional()
    @IsEnum(CaseUrgency)
    urgency?: CaseUrgency;

    @IsOptional()
    @IsString()
    requesting_agency?: string;

    @IsOptional()
    @IsString()
    agency_address?: string;

    @IsOptional()
    @IsString()
    agency_contact_name?: string;

    @IsOptional()
    @IsEmail()
    agency_contact_email?: string;

    @IsOptional()
    @IsString()
    @Matches(/^0\d{9}$/, {
        message: 'agency_contact_phone must be Vietnamese phone format: 0xxxxxxxxx (10 digits)',
    })
    agency_contact_phone?: string;

    @IsOptional()
    @IsString()
    @Matches(/^QD-\d{4}-\d{3}$/, {
        message: 'authorization_code must be in format QD-YYYY-XXX (e.g., QD-2024-001)',
    })
    authorization_code?: string;

    @IsOptional()
    @IsString()
    @Matches(/^SO-\d{3}\/\d{4}$/, {
        message: 'court_order_number must be in format SO-XXX/YYYY (e.g., SO-001/2024)',
    })
    court_order_number?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    authorization_date?: Date;

    @IsOptional()
    @IsString()
    case_description?: string;

    @IsOptional()
    @IsString()
    legal_purpose?: string;

    @IsOptional()
    @IsNumber()
    expected_participants?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ParticipantDto)
    participants?: ParticipantDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DocumentDto)
    documents?: DocumentDto[];

    @IsOptional()
    @IsString()
    agency_notes?: string;

    @IsOptional()
    @IsString()
    internal_notes?: string;

    @IsOptional()
    @IsString()
    denial_reason?: string;

    @IsOptional()
    assigned_staff_id?: string | null;

    @IsOptional()
    @IsString()
    result_delivery_method?: 'pickup' | 'mail' | 'email';

    @IsOptional()
    @IsString()
    result_recipient?: string;

    @IsOptional()
    @IsEnum(AdministrativeCaseStatus)
    status?: AdministrativeCaseStatus;

    @IsOptional()
    @IsBoolean()
    is_deleted?: boolean;
}
