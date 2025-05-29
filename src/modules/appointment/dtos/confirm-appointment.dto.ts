import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ConfirmAppointmentDto {
    @IsNotEmpty({ message: 'Kit ID is required' })
    @IsString({ message: 'Kit ID must be a string' })
    kit_id: string = '';

    @IsNotEmpty({ message: 'Laboratory technician ID is required' })
    @IsString({ message: 'Laboratory technician ID must be a string' })
    laboratory_technician_id: string = '';
} 