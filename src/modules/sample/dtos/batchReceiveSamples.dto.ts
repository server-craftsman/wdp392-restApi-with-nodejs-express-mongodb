import { IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class BatchReceiveSamplesDto {
    @IsArray()
    @IsString({ each: true })
    sample_ids: string[] = [];

    @IsNotEmpty()
    @IsDateString()
    received_date: string = '';
}
