import { IsString, IsDateString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class CreateAdministrativeAppointmentDto {
    @IsString()
    @IsNotEmpty()
    service_id!: string;

    @IsString()
    @IsNotEmpty()
    user_id!: string;

    @IsDateString()
    @IsOptional()
    appointment_date?: string;

    @IsString()
    @IsOptional()
    collection_address?: string;

    @IsString()
    @IsOptional()
    staff_id?: string;

    @IsString()
    @IsOptional()
    laboratory_technician_id?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    participants?: string[];
}

export class UpdateAppointmentProgressDto {
    @IsString()
    @IsNotEmpty()
    status!: string;
}
