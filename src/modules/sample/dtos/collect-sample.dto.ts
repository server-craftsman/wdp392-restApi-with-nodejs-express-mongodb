import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SampleTypeEnum } from '../sample.enum';

export class PersonInfoDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsString()
    gender?: string;

    @IsString()
    phone_number?: string;

    @IsDateString()
    dob?: string;

    @IsString()
    relationship?: string;

    @IsString()
    birth_place?: string;

    @IsString()
    nationality?: string;

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

    @Type(() => Date)
    collection_date?: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PersonInfoDto)
    person_info!: PersonInfoDto[];
} 