import { IsString, IsOptional, Matches } from 'class-validator';

export class CreateKitDto {
    @IsString()
    @IsOptional()
    @Matches(/^KIT-\d{8}-\d{3}$/, {
        message: 'Kit code must follow the format KIT-YYYYMMDD-###',
        each: false
    })
    code?: string;
} 