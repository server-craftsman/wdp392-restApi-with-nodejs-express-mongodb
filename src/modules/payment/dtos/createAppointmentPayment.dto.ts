import { IsNotEmpty, IsString, IsEnum, IsArray, IsOptional, ArrayNotEmpty, IsNumber, Min } from 'class-validator';
import { PaymentMethodEnum } from '../payment.enum';
import { Schema } from 'mongoose';

/**
 * DTO tạo thanh toán cho lịch hẹn khám
 * Định nghĩa dữ liệu cần thiết để tạo một giao dịch thanh toán cho cuộc hẹn xét nghiệm DNA
 */
export class CreateAppointmentPaymentDto {
    // ID của lịch hẹn cần thanh toán - Bắt buộc
    @IsNotEmpty({ message: 'ID lịch hẹn không được để trống' })
    @IsString({ message: 'ID lịch hẹn phải là chuỗi ký tự' })
    appointment_id!: string;

    // Phương thức thanh toán (CASH - tiền mặt, PAY_OS - thanh toán online)
    @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
    @IsEnum(PaymentMethodEnum, { message: 'Phương thức thanh toán không hợp lệ' })
    payment_method!: PaymentMethodEnum;

    // Danh sách ID mẫu xét nghiệm cần thanh toán - Tùy chọn
    // Nếu không cung cấp, hệ thống sẽ tự động lấy tất cả mẫu của lịch hẹn
    @IsOptional()
    @IsArray({ message: 'Danh sách ID mẫu phải là một mảng' })
    @IsString({ each: true, message: 'Mỗi ID mẫu phải là chuỗi ký tự' })
    sample_ids?: string[];

    // Số tiền tùy chỉnh - Tùy chọn, nếu không cung cấp sẽ tính tự động
    @IsOptional()
    @IsNumber({}, { message: 'Số tiền phải là số' })
    @Min(1000, { message: 'Số tiền tối thiểu là 1,000 VND' })
    custom_amount?: number;

    // Ghi chú thanh toán - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
    note?: string;

    // Thông tin người thanh toán - Tùy chọn cho PayOS
    @IsOptional()
    @IsString({ message: 'Tên người thanh toán phải là chuỗi ký tự' })
    payer_name?: string;

    // Email người thanh toán - Tùy chọn cho PayOS
    @IsOptional()
    @IsString({ message: 'Email người thanh toán phải là chuỗi ký tự' })
    payer_email?: string;

    // Số điện thoại người thanh toán - Tùy chọn cho PayOS
    @IsOptional()
    @IsString({ message: 'Số điện thoại người thanh toán phải là chuỗi ký tự' })
    payer_phone?: string;
} 