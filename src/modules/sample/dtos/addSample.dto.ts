import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { SampleTypeEnum } from '../sample.enum';

export class AddSampleDto {
    @IsMongoId()
    appointment_id: string = '';

    @IsMongoId()
    @IsOptional()
    kit_id?: string;

    @IsEnum(SampleTypeEnum, { each: true })
    sample_types: SampleTypeEnum[] = [SampleTypeEnum.SALIVA];

    @IsString()
    @IsOptional()
    notes?: string;
} 