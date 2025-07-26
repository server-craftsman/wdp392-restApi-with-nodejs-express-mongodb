import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { KitTypeEnum, KitStatusEnum } from '../kit.enum';

export class UpdateKitDto {
    @IsOptional()
    @IsString({ message: 'Kit code must be a string' })
    code?: string;

    @IsOptional()
    @IsEnum(KitTypeEnum, { message: 'Invalid kit type' })
    type?: KitTypeEnum;

    @IsOptional()
    @IsEnum(KitStatusEnum, { message: 'Invalid kit status' })
    status?: KitStatusEnum;

    @IsOptional()
    @IsDateString({}, { message: 'Assigned date must be a valid date string' })
    assigned_date?: string;

    @IsOptional()
    @IsString({ message: 'Assigned user ID must be a string' })
    assigned_to_user_id?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Return date must be a valid date string' })
    return_date?: string;

    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    notes?: string;

    // Administrative kit specific fields
    @IsOptional()
    @IsString({ message: 'Administrative case ID must be a string' })
    administrative_case_id?: string;

    @IsOptional()
    @IsString({ message: 'Agency authority must be a string' })
    agency_authority?: string;
}
