import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayMinSize, ArrayMaxSize, IsArray } from 'class-validator';
import { SampleTypeEnum } from '../sample.enum';
import { Type } from 'class-transformer';
import { PersonInfoDto } from './addSample.dto';

export class AddSampleWithMultiplePersonInfoDto {
    @IsMongoId()
    appointment_id: string = '';

    @IsMongoId()
    @IsOptional()
    kit_id?: string;

    @IsArray()
    @IsEnum(SampleTypeEnum, { each: true })
    @ArrayMinSize(2)
    sample_types: SampleTypeEnum[] = [];

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PersonInfoDto)
    @ArrayMinSize(2)
    person_info_list: PersonInfoDto[] = [];
} 