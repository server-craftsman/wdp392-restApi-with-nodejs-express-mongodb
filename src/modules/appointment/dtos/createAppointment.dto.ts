import { IsDate, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { TypeEnum } from '../appointment.enum';
import { Transform, Type } from 'class-transformer';

export class CreateAppointmentDto {
    @IsMongoId()
    service_id: string = '';

    @IsMongoId()
    @IsOptional()
    slot_id?: string;

    @IsOptional()
    @Type(() => Date)
    appointment_date?: Date;

    @IsEnum(TypeEnum)
    type: TypeEnum = TypeEnum.SELF;

    @IsString()
    @IsOptional()
    collection_address?: string;
}
