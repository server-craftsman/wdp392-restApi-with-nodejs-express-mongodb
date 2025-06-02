import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ResultDataDto {
    [key: string]: any;
}

export class CreateResultDto {
    @IsNotEmpty({ message: 'Sample IDs are required' })
    @IsArray({ message: 'Sample IDs must be an array' })
    @IsMongoId({ each: true, message: 'Each Sample ID must be a valid MongoDB ID' })
    sample_ids: string[] = [];

    @IsNotEmpty({ message: 'Appointment ID is required' })
    @IsMongoId({ message: 'Appointment ID must be a valid MongoDB ID' })
    appointment_id: string = '';

    @IsNotEmpty({ message: 'Customer ID is required' })
    @IsMongoId({ message: 'Customer ID must be a valid MongoDB ID' })
    customer_id: string = '';

    @IsNotEmpty({ message: 'Is match status is required' })
    @IsBoolean({ message: 'Is match must be a boolean value' })
    is_match: boolean = false;

    @IsOptional()
    @ValidateNested()
    @Type(() => ResultDataDto)
    result_data?: Record<string, any>;

    @IsOptional()
    @IsString({ message: 'Report URL must be a string' })
    report_url?: string;
} 