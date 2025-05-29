import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartTestingDto {
    @IsNotEmpty({ message: 'Testing start date is required' })
    @IsDateString({}, { message: 'Testing start date must be a valid date' })
    testing_start_date: string = '';

    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    notes?: string;
} 