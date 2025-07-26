import { IsString, IsOptional } from 'class-validator';

export class UpdateKitDto {
    @IsString()
    @IsOptional()
    notes?: string;
}
