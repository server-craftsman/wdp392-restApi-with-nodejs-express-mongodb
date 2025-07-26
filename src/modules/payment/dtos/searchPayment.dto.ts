import { IsOptional, IsString, IsEnum, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentStatusEnum, PaymentMethodEnum, PaymentTypeEnum } from '../payment.enum';

export class SearchPaymentDto {
    @IsOptional()
    @IsString()
    payment_no?: string;

    @IsOptional()
    @IsString()
    appointment_id?: string;

    @IsOptional()
    @IsString()
    user_id?: string; // Customer ID through appointment

    @IsOptional()
    @IsString()
    staff_id?: string; // Staff ID through appointment

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
    @Transform(({ value }: { value: any }) => typeof value === 'string' ? parseFloat(value) : value)
    @IsNumber()
    @Min(0)
    min_amount?: number;

    @IsOptional()
    @Transform(({ value }: { value: any }) => typeof value === 'string' ? parseFloat(value) : value)
    @IsNumber()
    @Min(0)
    max_amount?: number;

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;

    @IsOptional()
    @Transform(({ value }: { value: any }) => typeof value === 'string' ? parseInt(value, 10) : value)
    @IsNumber()
    @Min(1)
    @Max(100)
    pageNum?: number = 1;

    @IsOptional()
    @Transform(({ value }: { value: any }) => typeof value === 'string' ? parseInt(value, 10) : value)
    @IsNumber()
    @Min(1)
    @Max(100)
    pageSize?: number = 10;

    @IsOptional()
    @IsString()
    sort_by?: string = 'created_at';

    @IsOptional()
    @IsString()
    sort_order?: 'asc' | 'desc' = 'desc';
} 