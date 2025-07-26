import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { KitTypeEnum, KitStatusEnum } from '../kit.enum';

export class SearchKitDto {
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
    @IsString({ message: 'Assigned user ID must be a string' })
    assigned_to_user_id?: string;

    @IsOptional()
    @IsString({ message: 'Administrative case ID must be a string' })
    administrative_case_id?: string;

    @IsOptional()
    @IsString({ message: 'Agency authority must be a string' })
    agency_authority?: string;

    @IsOptional()
    @Transform(({ value }: { value: any }) => typeof value === 'string' ? parseInt(value, 10) : value)
    @IsNumber()
    @Min(1)
    @Max(100)
    pageNum?: number = 1;

    @IsOptional()
    @Transform(({ value }: { value: any }) => typeof value === 'string' ? parseInt(value, 10) : value)
    @IsNumber()
    @Min(1)
    @Max(100)
    pageSize?: number = 10;

    @IsOptional()
    @IsString()
    sort_by?: string = 'created_at';

    @IsOptional()
    @IsString()
    sort_order?: 'asc' | 'desc' = 'desc';
}
