import { IsArray, IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class StartTestingDto {
    @IsNotEmpty({ message: 'Testing start date is required' })
    @IsDateString({}, { message: 'Testing start date must be a valid date' })
    testing_start_date: string = '';

    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    notes?: string;

    @IsOptional()
    @IsArray({ message: 'Sample IDs must be an array' })
    @IsMongoId({ each: true, message: 'Each sample ID must be a valid MongoDB ID' })
    @Type(() => String)
    sample_ids?: string[];
} 