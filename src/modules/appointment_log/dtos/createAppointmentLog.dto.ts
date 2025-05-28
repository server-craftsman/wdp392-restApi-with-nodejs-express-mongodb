import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { AppointmentLogTypeEnum } from '../appointment_log.enum';
import { TypeEnum } from '../../appointment/appointment.enum';

export class CreateAppointmentLogDto {
    @IsMongoId()
    appointment_id: string = '';

    @IsMongoId()
    customer_id: string = '';

    @IsMongoId()
    @IsOptional()
    staff_id?: string;

    @IsMongoId()
    @IsOptional()
    laboratory_technician_id?: string;

    @IsEnum(AppointmentLogTypeEnum)
    @IsOptional()
    old_status?: AppointmentLogTypeEnum;

    @IsEnum(AppointmentLogTypeEnum)
    new_status: AppointmentLogTypeEnum = AppointmentLogTypeEnum.PENDING;

    @IsEnum(TypeEnum)
    type: TypeEnum = TypeEnum.SELF;
} 