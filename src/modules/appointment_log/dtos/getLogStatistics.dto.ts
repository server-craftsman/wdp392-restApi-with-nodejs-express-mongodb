import { IsOptional, IsDateString } from 'class-validator';

export class GetLogStatisticsDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
} 