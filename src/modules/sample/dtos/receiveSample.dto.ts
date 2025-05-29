import { IsDateString, IsNotEmpty } from 'class-validator';

export class ReceiveSampleDto {
    @IsNotEmpty({ message: 'Received date is required' })
    @IsDateString({}, { message: 'Received date must be a valid date' })
    received_date: string = '';
} 