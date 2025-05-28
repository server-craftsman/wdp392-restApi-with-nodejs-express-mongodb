import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class ReturnKitDto {
    @IsMongoId()
    kit_id: string = '';

    @IsString()
    @IsOptional()
    notes?: string;
} 