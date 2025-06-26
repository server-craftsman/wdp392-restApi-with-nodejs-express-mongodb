import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

/**
 * DTO xử lý webhook từ PayOS
 * Định nghĩa cấu trúc dữ liệu nhận từ webhook PayOS khi có sự thay đổi trạng thái thanh toán
 */
export class CreateWebhookDto {
    // Mã số thanh toán - Bắt buộc phải có trong mọi webhook
    @IsNotEmpty({ message: 'Mã thanh toán không được để trống' })
    @IsString({ message: 'Mã thanh toán phải là chuỗi ký tự' })
    payment_no!: string;

    // Số tiền thanh toán - Tùy chọn, PayOS có thể gửi hoặc không
    @IsOptional()
    @IsString({ message: 'Số tiền phải là chuỗi ký tự' })
    amount?: string;

    // Trạng thái thanh toán - Bắt buộc để biết kết quả thanh toán
    @IsNotEmpty({ message: 'Trạng thái thanh toán không được để trống' })
    @IsString({ message: 'Trạng thái thanh toán phải là chuỗi ký tự' })
    status!: string;

    // Chữ ký điện tử để xác thực webhook từ PayOS - Bắt buộc cho bảo mật
    @IsNotEmpty({ message: 'Chữ ký xác thực không được để trống' })
    @IsString({ message: 'Chữ ký xác thực phải là chuỗi ký tự' })
    signature!: string;

    // Mã đơn hàng số từ PayOS - Tùy chọn
    @IsOptional()
    @IsNumber({}, { message: 'Mã đơn hàng phải là số' })
    orderCode?: number;

    // Mô tả giao dịch - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
    description?: string;

    // Số tài khoản người thanh toán - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Số tài khoản phải là chuỗi ký tự' })
    accountNumber?: string;

    // Mã tham chiếu giao dịch - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Mã tham chiếu phải là chuỗi ký tự' })
    reference?: string;

    // Thời gian thực hiện giao dịch - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Thời gian giao dịch phải là chuỗi ký tự' })
    transactionDateTime?: string;

    // Đơn vị tiền tệ (VND, USD...) - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Đơn vị tiền tệ phải là chuỗi ký tự' })
    currency?: string;

    // ID liên kết thanh toán từ PayOS - Tùy chọn
    @IsOptional()
    @IsString({ message: 'ID liên kết thanh toán phải là chuỗi ký tự' })
    paymentLinkId?: string;

    // Mã phản hồi từ PayOS - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Mã phản hồi phải là chuỗi ký tự' })
    code?: string;

    // Mô tả chi tiết phản hồi - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Mô tả phản hồi phải là chuỗi ký tự' })
    desc?: string;

    // ID ngân hàng của tài khoản nhận - Tùy chọn
    @IsOptional()
    @IsString({ message: 'ID ngân hàng phải là chuỗi ký tự' })
    counterAccountBankId?: string;

    // Tên ngân hàng của tài khoản nhận - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Tên ngân hàng phải là chuỗi ký tự' })
    counterAccountBankName?: string;

    // Tên chủ tài khoản nhận - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Tên chủ tài khoản phải là chuỗi ký tự' })
    counterAccountName?: string;

    // Số tài khoản nhận - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Số tài khoản nhận phải là chuỗi ký tự' })
    counterAccountNumber?: string;

    // Tên tài khoản ảo (nếu có) - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Tên tài khoản ảo phải là chuỗi ký tự' })
    virtualAccountName?: string;

    // Số tài khoản ảo (nếu có) - Tùy chọn
    @IsOptional()
    @IsString({ message: 'Số tài khoản ảo phải là chuỗi ký tự' })
    virtualAccountNumber?: string;
}
