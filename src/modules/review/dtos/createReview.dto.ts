import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateReviewDto {
    @IsNotEmpty()
    @IsNumber()
    rating: number = 0;

    @IsNotEmpty()
    @IsString()
    comment: string = '';

    @IsNotEmpty()
    @IsString()
    appointment_id: string = '';

    @IsOptional()
    @IsString()
    customer_id?: string;
}