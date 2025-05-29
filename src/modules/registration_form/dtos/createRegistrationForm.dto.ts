import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SampleTypeEnum } from '../../sample/sample.enum';

export class CreateRegistrationFormDto {
    @IsNotEmpty({ message: 'Sample ID is required' })
    @IsMongoId({ message: 'Sample ID must be a valid MongoDB ID' })
    sample_id: string = '';

    @IsNotEmpty({ message: 'Patient name is required' })
    @IsString({ message: 'Patient name must be a string' })
    patient_name: string = '';

    @IsNotEmpty({ message: 'Gender is required' })
    @IsString({ message: 'Gender must be a string' })
    gender: string = '';

    @IsOptional()
    @IsString({ message: 'Phone number must be a string' })
    phone_number?: string;

    @IsOptional()
    @IsString({ message: 'Email must be a string' })
    email?: string;

    @IsNotEmpty({ message: 'Sample type is required' })
    @IsEnum(SampleTypeEnum, { message: 'Sample type must be a valid type' })
    sample_type: string = '';

    @IsNotEmpty({ message: 'Relationship is required' })
    @IsString({ message: 'Relationship must be a string' })
    relationship: string = '';

    @IsNotEmpty({ message: 'Collection date is required' })
    @IsDateString({}, { message: 'Collection date must be a valid date' })
    collection_date: string = '';
} 