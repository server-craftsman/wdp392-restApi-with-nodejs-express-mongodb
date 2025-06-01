import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePayosPaymentDto {
    constructor(
        amount: number,
        order_code: string,
        description: string,
        buyer_name?: string,
        buyer_email?: string,
        buyer_phone?: string,
        appointment_id?: string
    ) {
        this.amount = amount;
        this.order_code = order_code;
        this.description = description;
        this.buyer_name = buyer_name;
        this.buyer_email = buyer_email;
        this.buyer_phone = buyer_phone;
        this.appointment_id = appointment_id;
    }

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    appointment_id?: string;

    @IsNotEmpty()
    @IsString()
    order_code: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    buyer_name?: string;

    @IsOptional()
    @IsString()
    buyer_email?: string;

    @IsOptional()
    @IsString()
    buyer_phone?: string;
}