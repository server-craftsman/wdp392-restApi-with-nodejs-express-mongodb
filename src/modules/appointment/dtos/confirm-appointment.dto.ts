import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmAppointmentDto {
    @IsNotEmpty({ message: 'Slot ID is required' })
    @IsString({ message: 'Slot ID must be a string' })
    slot_id: string = '';

    @IsNotEmpty({ message: 'Lab technician ID is required' })
    @IsString({ message: 'Lab technician ID must be a string' })
    lab_tech_id: string = '';
} 