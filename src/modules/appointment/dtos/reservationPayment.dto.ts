import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ReservationPaymentTypeEnum } from '../appointment.enum';
import { PaymentTypeEnum } from '../../payment/payment.enum';

export class ReservationPaymentDto {
    @IsString()
    reservation_id!: string;

    @IsEnum(ReservationPaymentTypeEnum)
    payment_type!: ReservationPaymentTypeEnum;

    @IsNumber()
    @Min(0)
    amount!: number;

    @IsEnum(PaymentTypeEnum)
    payment_method!: PaymentTypeEnum;

    @IsOptional()
    @IsString()
    payment_reference?: string;
} 