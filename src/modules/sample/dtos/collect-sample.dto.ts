import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SampleTypeEnum } from '../sample.enum';

export class PersonInfoDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsDateString()
    dob?: string;

    @IsOptional()
    @IsString()
    relationship?: string;

    @IsOptional()
    @IsString()
    birth_place?: string;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @IsString()
    identity_document?: string;
}

export class CollectSampleDto {
    @IsNotEmpty()
    @IsString()
    appointment_id!: string;

    @IsArray()
    @IsEnum(SampleTypeEnum, { each: true })
    type!: SampleTypeEnum[];

    @IsOptional()
    @Type(() => Date)
    collection_date?: Date;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PersonInfoDto)
    person_info?: PersonInfoDto[];
}
