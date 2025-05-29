import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SampleTypeEnum } from '../../sample/sample.enum';

export class UpdateRegistrationFormDto {
    @IsOptional()
    @IsString({ message: 'Patient name must be a string' })
    patient_name?: string;

    @IsOptional()
    @IsString({ message: 'Gender must be a string' })
    gender?: string;

    @IsOptional()
    @IsString({ message: 'Phone number must be a string' })
    phone_number?: string;

    @IsOptional()
    @IsString({ message: 'Email must be a string' })
    email?: string;

    @IsOptional()
    @IsEnum(SampleTypeEnum, { message: 'Sample type must be a valid type' })
    sample_type?: string;

    @IsOptional()
    @IsString({ message: 'Relationship must be a string' })
    relationship?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Collection date must be a valid date' })
    collection_date?: string;
} 