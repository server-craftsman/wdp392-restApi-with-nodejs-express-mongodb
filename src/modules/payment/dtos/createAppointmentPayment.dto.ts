import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { PaymentMethodEnum } from '../payment.enum';

export class CreateAppointmentPaymentDto {
    @IsString()
    appointment_id!: string;

    @IsEnum(PaymentMethodEnum)
    payment_method!: PaymentMethodEnum;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sample_ids?: string[];

    @IsOptional()
    @IsString()
    custom_amount?: string;
} 