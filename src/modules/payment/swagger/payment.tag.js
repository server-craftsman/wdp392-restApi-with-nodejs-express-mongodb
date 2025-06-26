/**
 * @swagger
 * tags:
 *   - name: payment
 *     description: |
 *       **API Quản lý Thanh toán**
 *       
 *       Hệ thống thanh toán tích hợp với PayOS cho phép xử lý các giao dịch thanh toán
 *       cho dịch vụ xét nghiệm DNA. Bao gồm các tính năng:
 *       
 *       - **Thanh toán tiền mặt:** Thanh toán trực tiếp tại phòng khám
 *       - **Thanh toán online:** Tích hợp với cổng PayOS
 *       - **Webhook processing:** Xử lý callback từ PayOS
 *       - **Xác minh thanh toán:** Kiểm tra trạng thái với PayOS
 *       - **Quản lý đơn hàng:** Hủy, hoàn tiền, theo dõi
 *       
 *       **Luồng thanh toán PayOS:**
 *       1. Tạo thanh toán → Nhận checkout URL
 *       2. Người dùng thanh toán trên PayOS
 *       3. PayOS gửi webhook → Cập nhật trạng thái
 *       4. Redirect người dùng về trang kết quả
 *       
 *       **Bảo mật:**
 *       - HMAC-SHA256 signature verification
 *       - JWT authentication cho API
 *       - Input validation với class-validator
 *     externalDocs:
 *       description: PayOS Documentation
 *       url: https://payos.vn/docs
 */ 