import { IsDateString, IsOptional } from 'class-validator';

export class SubmitSampleDto {
    @IsOptional()
    @IsDateString({}, { message: 'Collection date must be a valid date' })
    collection_date?: string;
} 