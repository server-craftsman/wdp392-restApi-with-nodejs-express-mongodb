import { IsOptional, IsString, IsEnum, Matches } from 'class-validator';
import { KitTypeEnum, KitStatusEnum } from '../kit.enum';

export class CreateKitDto {
    @IsOptional()
    @IsString({ message: 'Kit code must be a string' })
    @Matches(/^KIT-\d{8}-\d{3}$/, {
        message: 'Kit code must follow the format KIT-YYYYMMDD-###',
        each: false
    })
    code?: string;

    @IsOptional()
    @IsEnum(KitTypeEnum, { message: 'Invalid kit type' })
    type?: KitTypeEnum;

    @IsOptional()
    @IsEnum(KitStatusEnum, { message: 'Invalid kit status' })
    status?: KitStatusEnum;

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
