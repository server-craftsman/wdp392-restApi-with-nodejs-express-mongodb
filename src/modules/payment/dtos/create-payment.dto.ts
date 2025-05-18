import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
    constructor(amount: number, orderDescription: string, appointment_id: string) {
        this.amount = amount;
        this.orderDescription = orderDescription;
        this.appointment_id = appointment_id;
    }

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    orderDescription: string;

    @IsOptional()
    @IsString()
    bankCode?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsNotEmpty()
    @IsString()
    appointment_id: string;
} 