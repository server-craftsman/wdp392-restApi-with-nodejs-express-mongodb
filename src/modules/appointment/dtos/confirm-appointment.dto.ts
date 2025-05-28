import { IsMongoId } from 'class-validator';

export class ConfirmAppointmentDto {
    @IsMongoId()
    kit_id: string = '';
} 