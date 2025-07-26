import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { KitTypeEnum } from '../kit.enum';

export class AssignKitDto {
    @IsString({ message: 'Technician ID must be a string' })
    @IsNotEmpty({ message: 'Technician ID is required' })
    technician_id!: string;

    @IsOptional()
    @IsEnum(KitTypeEnum, { message: 'Invalid kit type' })
    type?: KitTypeEnum;

    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    notes?: string;
}
