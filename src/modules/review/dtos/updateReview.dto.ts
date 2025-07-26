import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateReviewDto {
    @IsNotEmpty()
    @IsNumber()
    rating: number = 0;

    @IsNotEmpty()
    @IsString()
    comment: string = '';

    @IsNotEmpty()
    @IsString()
    appointment_id: string = '';
}
