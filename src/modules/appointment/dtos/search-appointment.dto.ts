import { IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { AppointmentStatusEnum, TypeEnum } from '../appointment.enum';

export class SearchAppointmentDto {
    @IsOptional()
    @IsNumber()
    pageNum?: number = 1;

    @IsOptional()
    @IsNumber()
    pageSize?: number = 10;

    @IsOptional()
    @IsMongoId()
    user_id?: string;

    @IsOptional()
    @IsMongoId()
    service_id?: string;

    @IsOptional()
    @IsEnum(AppointmentStatusEnum)
    status?: AppointmentStatusEnum;

    @IsOptional()
    @IsEnum(TypeEnum)
    type?: TypeEnum;

    @IsOptional()
    @IsMongoId()
    staff_id?: string;

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;

    @IsOptional()
    @IsString()
    search_term?: string;
} 