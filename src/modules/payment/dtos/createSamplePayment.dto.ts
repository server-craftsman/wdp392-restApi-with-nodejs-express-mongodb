import { IsNumber, Min } from 'class-validator';

export class CreateSamplePaymentDto {
    @IsNumber()
    @Min(1)
    amount!: number;
} 