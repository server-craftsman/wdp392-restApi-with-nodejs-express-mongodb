import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { SampleTypeEnum } from '../sample.enum';

export class AddSampleDto {
    @IsMongoId()
    appointment_id: string = '';

    @IsMongoId()
    @IsOptional()
    kit_id?: string;

    @IsEnum(SampleTypeEnum)
    type: SampleTypeEnum = SampleTypeEnum.SALIVA;

    @IsString()
    @IsOptional()
    notes?: string;
} 