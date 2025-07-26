import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, MaxLength, IsEmail, Matches } from 'class-validator';

/**
 * DTO tạo thanh toán PayOS
 * Định nghĩa dữ liệu cần thiết để tạo link thanh toán online qua cổng PayOS
 */
export class CreatePayosPaymentDto {
    constructor(amount: number, order_code: string, description: string, buyer_name?: string, buyer_email?: string, buyer_phone?: string, appointment_id?: string) {
        this.amount = amount;
        this.order_code = order_code;
        this.description = description;
        this.buyer_name = buyer_name;
        this.buyer_email = buyer_email;
        this.buyer_phone = buyer_phone;
        this.appointment_id = appointment_id;
    }

    // Số tiền thanh toán - Bắt buộc, tối thiểu 1,000 VND theo quy định PayOS
    @IsNotEmpty({ message: 'Số tiền thanh toán không được để trống' })
    @IsNumber({}, { message: 'Số tiền phải là một số hợp lệ' })
    @Min(1000, { message: 'Số tiền tối thiểu là 1,000 VND' })
    amount: number;

    // ID lịch hẹn liên quan - Tùy chọn, để liên kết thanh toán với lịch hẹn
    @IsOptional()
    @IsString({ message: 'ID lịch hẹn phải là chuỗi ký tự' })
    appointment_id?: string;

    // Mã đơn hàng duy nhất - Bắt buộc, được tạo tự động bởi hệ thống
    @IsNotEmpty({ message: 'Mã đơn hàng không được để trống' })
    @IsString({ message: 'Mã đơn hàng phải là chuỗi ký tự' })
    @MaxLength(50, { message: 'Mã đơn hàng không được quá 50 ký tự' })
    order_code: string;

    // Mô tả giao dịch - Bắt buộc, hiển thị cho người dùng
    @IsNotEmpty({ message: 'Mô tả giao dịch không được để trống' })
    @IsString({ message: 'Mô tả giao dịch phải là chuỗi ký tự' })
    @MaxLength(25, { message: 'Mô tả không được quá 25 ký tự theo quy định PayOS' })
    description: string;

    // Tên người mua - Tùy chọn, hiển thị trên giao diện thanh toán
    @IsOptional()
    @IsString({ message: 'Tên người mua phải là chuỗi ký tự' })
    @MaxLength(100, { message: 'Tên người mua không được quá 100 ký tự' })
    buyer_name?: string;

    // Email người mua - Tùy chọn, để gửi hóa đơn điện tử
    @IsOptional()
    @IsString({ message: 'Email phải là chuỗi ký tự' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    buyer_email?: string;

    // Số điện thoại người mua - Tùy chọn, để liên hệ xác nhận
    @IsOptional()
    @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
    @Matches(/^[0-9+\-\s()]{10,15}$/, { message: 'Số điện thoại không đúng định dạng' })
    buyer_phone?: string;
}
