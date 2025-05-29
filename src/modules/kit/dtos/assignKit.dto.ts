import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignKitDto {
    @IsNotEmpty({ message: 'Appointment ID is required' })
    @IsMongoId({ message: 'Invalid appointment ID format' })
    appointment_id: string = '';

    @IsNotEmpty({ message: 'Laboratory technician ID is required' })
    @IsMongoId({ message: 'Invalid laboratory technician ID format' })
    laboratory_technician_id: string = '';
} 