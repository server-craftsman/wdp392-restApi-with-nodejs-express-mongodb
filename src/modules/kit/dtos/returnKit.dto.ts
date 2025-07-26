import { IsOptional, IsString, IsEnum } from 'class-validator';
import { KitStatusEnum } from '../kit.enum';

export class ReturnKitDto {
    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    notes?: string;

    @IsOptional()
    @IsEnum(KitStatusEnum, { message: 'Invalid kit status' })
    status?: KitStatusEnum;
}
