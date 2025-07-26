import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayMinSize, ArrayMaxSize, IsUrl } from 'class-validator';
import { SampleTypeEnum } from '../sample.enum';
import { Type } from 'class-transformer';

export class PersonInfoDto {
    @IsNotEmpty()
    @IsString()
    name: string = '';

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dob?: Date;

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

    @IsOptional()
    @IsString()
    image_url?: string;
}

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

    @IsOptional()
    @ValidateNested()
    @Type(() => PersonInfoDto)
    person_info?: PersonInfoDto;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => PersonInfoDto)
    person_info_list?: PersonInfoDto[];

    @IsOptional()
    @IsString()
    collection_method?: string;
}
