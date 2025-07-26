import { IsNumber, Min, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO tạo thanh toán mẫu xét nghiệm
 * Định nghĩa dữ liệu cần thiết để tạo thanh toán cho các mẫu xét nghiệm riêng lẻ
 */
export class CreateSamplePaymentDto {
    // Số tiền thanh toán - Bắt buộc, tối thiểu 1,000 VND
    @IsNotEmpty({ message: 'Số tiền thanh toán không được để trống' })
    @IsNumber({}, { message: 'Số tiền phải là một số hợp lệ' })
    @Min(1000, { message: 'Số tiền tối thiểu là 1,000 VND' })
    amount: number;

    // ID mẫu xét nghiệm - Tùy chọn, để liên kết thanh toán với mẫu cụ thể
    @IsOptional()
    @IsString({ message: 'ID mẫu xét nghiệm phải là chuỗi ký tự' })
    sample_id?: string;

    // Ghi chú thanh toán - Tùy chọn, mô tả thêm về thanh toán
    @IsOptional()
    @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
    @MaxLength(500, { message: 'Ghi chú không được quá 500 ký tự' })
    note?: string;

    constructor(amount: number, sample_id?: string, note?: string) {
        this.amount = amount;
        this.sample_id = sample_id;
        this.note = note;
    }
}
