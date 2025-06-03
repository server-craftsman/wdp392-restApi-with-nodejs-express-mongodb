import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class BatchSubmitSamplesDto {
    @IsArray()
    @IsString({ each: true })
    sample_ids: string[] = [];

    @IsOptional()
    @IsDateString()
    collection_date?: string;
} 