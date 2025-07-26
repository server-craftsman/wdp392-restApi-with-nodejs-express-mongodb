import { IsString, IsNumber, IsOptional, IsDate, IsArray, IsEnum, IsEmail, Min, MaxLength, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TypeEnum, ReservationTypeEnum, TestingNeedEnum } from '../appointment.enum';

export class CreateReservationDto {
    @IsString()
    service_id!: string;

    @IsEnum(TestingNeedEnum)
    testing_need!: TestingNeedEnum;

    @IsOptional()
    @IsNumber()
    @Min(0)
    total_amount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    deposit_amount?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    preferred_appointment_date?: Date;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    preferred_time_slots?: string[];

    @IsOptional()
    @IsEnum(TypeEnum)
    collection_type?: TypeEnum;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    collection_address?: string;

    @IsNumber()
    @Min(100000000)  // 9 digits minimum (e.g., 012345678)
    @Max(999999999999)  // 12 digits maximum (e.g., 84987654321)
    contact_phone!: number;

    @IsEmail()
    contact_email!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    special_requirements?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    notes?: string[];
} 