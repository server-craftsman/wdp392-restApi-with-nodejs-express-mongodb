import { IsArray, IsDate, IsEnum, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TypeEnum } from '../appointment.enum';
import { Transform, Type } from 'class-transformer';
import { SampleTypeEnum } from '../../sample/sample.enum';

export class SampleSelectionDto {
    @IsEnum(SampleTypeEnum)
    type: SampleTypeEnum = SampleTypeEnum.SALIVA;
}

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

    /**
     * @deprecated Use /api/sample/add-to-appointment endpoint instead
     */
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SampleSelectionDto)
    @IsOptional()
    samples?: SampleSelectionDto[] = [];
}
