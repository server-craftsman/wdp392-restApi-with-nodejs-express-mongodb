import { IsNotEmpty, IsString, IsEnum, IsArray, IsOptional, ArrayNotEmpty } from 'class-validator';
import { PaymentMethodEnum } from '../payment.enum';
import { Schema } from 'mongoose';

export class CreateAppointmentPaymentDto {
    @IsNotEmpty()
    @IsString()
    appointment_id!: string;

    @IsNotEmpty()
    @IsEnum(PaymentMethodEnum)
    payment_method!: PaymentMethodEnum;

    @IsOptional()
    @IsArray()
    sample_ids?: string[];
} 