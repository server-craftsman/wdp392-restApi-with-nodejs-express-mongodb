import { IsString, IsOptional, IsEnum, IsDateString, IsEmail, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';
import { TypeEnum } from '../appointment.enum';

export class CreateConsultationDto {
    @IsString()
    @MinLength(2, { message: 'First name must be at least 2 characters long' })
    @MaxLength(50, { message: 'First name must not exceed 50 characters' })
    first_name!: string;

    @IsString()
    @MinLength(2, { message: 'Last name must be at least 2 characters long' })
    @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
    last_name!: string;

    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @IsString()
    @MinLength(10, { message: 'Phone number must be at least 10 characters long' })
    @MaxLength(15, { message: 'Phone number must not exceed 15 characters' })
    phone_number!: string;

    @IsEnum(TypeEnum, { message: 'Type must be either HOME or FACILITY' })
    type!: TypeEnum;

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Collection address must not exceed 500 characters' })
    collection_address?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Invalid date format for preferred date' })
    preferred_date?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Consultation notes must not exceed 1000 characters' })
    consultation_notes?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'Preferred time must not exceed 200 characters' })
    preferred_time?: string;

    @IsString()
    @MinLength(5, { message: 'Subject must be at least 5 characters long' })
    @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
    subject!: string;
} 