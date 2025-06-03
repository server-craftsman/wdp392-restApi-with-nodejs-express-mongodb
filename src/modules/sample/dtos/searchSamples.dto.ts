import { IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SampleStatusEnum, SampleTypeEnum } from '../sample.enum';

export class SearchSamplesDto {
    @IsOptional()
    @IsEnum(SampleStatusEnum, { message: 'Status must be a valid sample status' })
    status?: SampleStatusEnum;

    @IsOptional()
    @IsEnum(SampleTypeEnum, { message: 'Type must be a valid sample type' })
    type?: SampleTypeEnum;

    @IsOptional()
    @IsMongoId({ message: 'Appointment ID must be a valid MongoDB ID' })
    appointmentId?: string;

    @IsOptional()
    @IsString({ message: 'Kit code must be a string' })
    kitCode?: string;

    @IsOptional()
    @IsString({ message: 'Person name must be a string' })
    personName?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Start date must be a valid date string' })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'End date must be a valid date string' })
    endDate?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Page must be a number' })
    @Min(1, { message: 'Page must be at least 1' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Limit must be a number' })
    @Min(1, { message: 'Limit must be at least 1' })
    limit?: number = 10;
} 