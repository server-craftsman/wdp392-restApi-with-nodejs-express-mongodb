import { IsString, IsOptional, IsEnum, IsMongoId, IsNumber } from 'class-validator';
import { KitStatusEnum } from '../kit.enum';

export class SearchKitDto {
    @IsString()
    @IsOptional()
    code?: string;

    @IsEnum(KitStatusEnum)
    @IsOptional()
    status?: KitStatusEnum;

    @IsMongoId()
    @IsOptional()
    appointment_id?: string;

    @IsMongoId()
    @IsOptional()
    assigned_to_user_id?: string;

    @IsNumber()
    @IsOptional()
    pageNum?: number;

    @IsNumber()
    @IsOptional()
    pageSize?: number;
}
