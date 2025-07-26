import { IsOptional, IsDateString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentStatusEnum, PaymentMethodEnum, PaymentTypeEnum } from '../payment.enum';

export class PaymentStatisticsDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsEnum(PaymentStatusEnum)
    status?: PaymentStatusEnum;

    @IsOptional()
    @IsEnum(PaymentMethodEnum)
    payment_method?: PaymentMethodEnum;

    @IsOptional()
    @IsEnum(PaymentTypeEnum)
    payment_type?: PaymentTypeEnum;

    @IsOptional()
    @Transform(({ value }: { value: any }) => typeof value === 'string' ? parseInt(value, 10) : value)
    @IsNumber()
    @Min(1)
    @Max(365)
    days?: number = 30; // Default to 30 days if no date range specified
} 