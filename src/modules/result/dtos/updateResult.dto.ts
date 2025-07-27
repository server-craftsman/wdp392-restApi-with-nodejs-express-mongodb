import { IsBoolean, IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateResultDto {
    @IsOptional()
    @IsBoolean({ message: 'Is match must be a boolean value' })
    is_match?: boolean;

    @IsOptional()
    @IsObject({ message: 'Result data must be an object' })
    result_data?: Record<string, any>;

    @IsOptional()
    @IsString({ message: 'Report URL must be a string' })
    report_url?: string;
}
