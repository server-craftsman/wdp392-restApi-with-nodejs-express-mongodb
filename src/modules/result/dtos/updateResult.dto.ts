import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ResultDataDto {
    [key: string]: any;
}

export class UpdateResultDto {
    @IsOptional()
    @IsBoolean({ message: 'Is match must be a boolean value' })
    is_match?: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => ResultDataDto)
    result_data?: Record<string, any>;

    @IsOptional()
    @IsString({ message: 'Report URL must be a string' })
    report_url?: string;
}
