/**
 * @swagger
 * components:
 *   schemas:
 *     # ================== ENUM SCHEMAS ==================
 *     PaymentStatus:
 *       type: string
 *       enum: [pending, processing, completed, cancelled, failed, refunded]
 *       description: |
 *         Trạng thái thanh toán trong hệ thống:
 *         - pending: Đang chờ xử lý
 *         - processing: Đang được xử lý bởi cổng thanh toán
 *         - completed: Hoàn thành thành công
 *         - cancelled: Đã bị hủy
 *         - failed: Thất bại
 *         - refunded: Đã hoàn tiền
 *       example: completed
 *     
 *     PaymentMethod:
 *       type: string
 *       enum: [CASH, PAY_OS]
 *       description: |
 *         Phương thức thanh toán được hỗ trợ:
 *         - CASH: Thanh toán tiền mặt tại phòng khám
 *         - PAY_OS: Thanh toán online qua cổng PayOS
 *       example: PAY_OS
 *     
 *     SampleType:
 *       type: string
 *       enum: [blood, saliva, hair, tissue]
 *       description: |
 *         Loại mẫu xét nghiệm DNA:
 *         - blood: Mẫu máu
 *         - saliva: Mẫu nước bọt
 *         - hair: Mẫu tóc
 *         - tissue: Mẫu mô
 *       example: blood
 *     
 *     SampleStatus:
 *       type: string
 *       enum: [pending, collected, processing, completed, failed]
 *       description: |
 *         Trạng thái xử lý mẫu xét nghiệm:
 *         - pending: Chờ lấy mẫu
 *         - collected: Đã lấy mẫu
 *         - processing: Đang xét nghiệm
 *         - completed: Hoàn thành xét nghiệm
 *         - failed: Xét nghiệm thất bại
 *       example: pending
 *     
 *     # ================== PAYMENT SCHEMAS ==================
 *     Payment:
 *       type: object
 *       description: Schema đầy đủ của một thanh toán trong hệ thống
 *       properties:
 *         _id:
 *           type: string
 *           description: ID duy nhất của thanh toán trong MongoDB
 *           example: "64a1b2c3d4e5f6789abcdef0"
 *         payment_no:
 *           type: string
 *           description: Mã số thanh toán duy nhất, dễ đọc cho người dùng
 *           example: "PAY_123456789"
 *         appointment_id:
 *           type: string
 *           description: ID của lịch hẹn liên quan đến thanh toán này
 *           example: "64a1b2c3d4e5f6789abcdef1"
 *         sample_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID các mẫu xét nghiệm được thanh toán
 *           example: ["64a1b2c3d4e5f6789abcdef2", "64a1b2c3d4e5f6789abcdef3"]
 *         amount:
 *           type: number
 *           description: Tổng số tiền thanh toán (VND)
 *           minimum: 1000
 *           example: 500000
 *         payment_method:
 *           $ref: '#/components/schemas/PaymentMethod'
 *         status:
 *           $ref: '#/components/schemas/PaymentStatus'
 *         note:
 *           type: string
 *           description: Ghi chú của người thanh toán
 *           example: "Thanh toán xét nghiệm DNA cơ bản"
 *         # PayOS specific fields - Các trường dành riêng cho PayOS
 *         payos_payment_id:
 *           type: string
 *           description: ID thanh toán từ PayOS (nếu thanh toán qua PayOS)
 *           example: "payos_12345_67890"
 *         payos_checkout_url:
 *           type: string
 *           description: Link thanh toán PayOS cho người dùng
 *           example: "https://pay.payos.vn/web/payment/123456"
 *         payos_web_id:
 *           type: string
 *           description: ID web thanh toán PayOS
 *           example: "web_123456"
 *         payos_payment_status:
 *           type: string
 *           description: Trạng thái thanh toán trả về từ PayOS
 *           enum: [PENDING, PAID, CANCELLED, EXPIRED]
 *           example: "PAID"
 *         payos_payment_status_time:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật trạng thái từ PayOS
 *           example: "2024-01-01T10:30:00.000Z"
 *         payos_webhook_received_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian nhận webhook từ PayOS
 *           example: "2024-01-01T10:30:05.000Z"
 *         order_code:
 *           type: number
 *           description: Mã đơn hàng số cho PayOS
 *           example: 123456789
 *         # Payer information - Thông tin người thanh toán
 *         payer_name:
 *           type: string
 *           description: Tên người thanh toán
 *           example: "Nguyễn Văn A"
 *         payer_email:
 *           type: string
 *           format: email
 *           description: Email người thanh toán
 *           example: "nguyenvana@email.com"
 *         payer_phone:
 *           type: string
 *           description: Số điện thoại người thanh toán
 *           example: "0987654321"
 *         # Timestamps - Thời gian
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo thanh toán
 *           example: "2024-01-01T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật gần nhất
 *           example: "2024-01-01T10:30:00.000Z"
 *     
 *     # ================== REQUEST SCHEMAS ==================
 *     CreateAppointmentPaymentRequest:
 *       type: object
 *       description: Schema yêu cầu tạo thanh toán cho lịch hẹn
 *       required:
 *         - appointment_id
 *         - payment_method
 *       properties:
 *         appointment_id:
 *           type: string
 *           description: ID của lịch hẹn cần thanh toán (bắt buộc)
 *           example: "64a1b2c3d4e5f6789abcdef0"
 *         payment_method:
 *           $ref: '#/components/schemas/PaymentMethod'
 *         sample_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: |
 *             Danh sách ID mẫu xét nghiệm cần thanh toán (tùy chọn).
 *             Nếu không cung cấp, hệ thống sẽ tự động lấy tất cả mẫu của lịch hẹn.
 *           example: ["64a1b2c3d4e5f6789abcdef1", "64a1b2c3d4e5f6789abcdef2"]
 *     PaymentWebhookRequest:
 *       type: object
 *       description: Schema webhook từ PayOS
 *       required:
 *         - payment_no
 *         - status
 *         - signature
 *       properties:
 *         payment_no:
 *           type: string
 *           description: Mã số thanh toán (bắt buộc)
 *           example: "PAY_123456789"
 *         amount:
 *           type: string
 *           description: Số tiền thanh toán (tùy chọn)
 *           example: "500000"
 *         status:
 *           type: string
 *           enum: [pending, paid, cancelled, expired]
 *           description: Trạng thái thanh toán từ PayOS (bắt buộc)
 *           example: "PAID"
 *         signature:
 *           type: string
 *           description: Chữ ký HMAC-SHA256 để xác thực webhook (bắt buộc)
 *           example: "abc123def456..."
 *         orderCode:
 *           type: number
 *           description: Mã đơn hàng số (tùy chọn)
 *           example: 123456789
 *         description:
 *           type: string
 *           description: Mô tả giao dịch (tùy chọn)
 *           example: "Thanh toan xet nghiem DNA"
 *         # Các trường bổ sung từ PayOS
 *         accountNumber:
 *           type: string
 *           description: Số tài khoản thanh toán
 *         reference:
 *           type: string
 *           description: Mã tham chiếu giao dịch
 *         transactionDateTime:
 *           type: string
 *           description: Thời gian thực hiện giao dịch
 *         currency:
 *           type: string
 *           description: Đơn vị tiền tệ
 *           example: "VND"
 *     
 *     # ================== RESPONSE SCHEMAS ==================
 *     PaymentResponse:
 *       type: object
 *       description: Schema phản hồi khi tạo/lấy thông tin thanh toán
 *       properties:
 *         id:
 *           type: string
 *           description: ID thanh toán trong database
 *           example: "64a1b2c3d4e5f6789abcdef0"
 *         payment_no:
 *           type: string
 *           description: Mã số thanh toán
 *           example: "PAY_123456789"
 *         amount:
 *           type: number
 *           description: Số tiền thanh toán (VND)
 *           example: 500000
 *         status:
 *           $ref: '#/components/schemas/PaymentStatus'
 *         payment_method:
 *           $ref: '#/components/schemas/PaymentMethod'
 *         appointment_id:
 *           type: string
 *           description: ID lịch hẹn liên quan
 *           example: "64a1b2c3d4e5f6789abcdef1"
 *         payos_checkout_url:
 *           type: string
 *           description: Link thanh toán PayOS (chỉ có khi thanh toán qua PayOS)
 *           example: "https://pay.payos.vn/web/payment/123456"
 *         note:
 *           type: string
 *           description: Ghi chú thanh toán
 *           example: "Thanh toán xét nghiệm DNA cơ bản"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo thanh toán
 *           example: "2024-01-01T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật gần nhất
 *           example: "2024-01-01T10:30:00.000Z"
 *     
 *     PaymentVerificationResponse:
 *       type: object
 *       description: Schema phản hồi khi xác minh trạng thái thanh toán
 *       properties:
 *         payment_status:
 *           $ref: '#/components/schemas/PaymentStatus'
 *         payment_info:
 *           $ref: '#/components/schemas/PaymentResponse'
 *         verification_time:
 *           type: string
 *           format: date-time
 *           description: Thời gian thực hiện xác minh
 *           example: "2024-01-01T10:35:00.000Z"
 *         payos_status:
 *           type: string
 *           description: Trạng thái từ PayOS API
 *           example: "PAID"
 *     
 *     # ================== SAMPLE SCHEMAS ==================
 *     SampleInfo:
 *       type: object
 *       description: Schema thông tin mẫu xét nghiệm
 *       properties:
 *         sample_id:
 *           type: string
 *           description: ID duy nhất của mẫu xét nghiệm
 *           example: "64a1b2c3d4e5f6789abcdef1"
 *         sample_code:
 *           type: string
 *           description: Mã mẫu để theo dõi
 *           example: "DNA_SAMPLE_001"
 *         sample_type:
 *           $ref: '#/components/schemas/SampleType'
 *         test_type:
 *           type: string
 *           description: Loại xét nghiệm DNA
 *           example: "Paternity Test"
 *         amount:
 *           type: number
 *           description: Giá tiền cho mẫu này (VND)
 *           example: 250000
 *         status:
 *           $ref: '#/components/schemas/SampleStatus'
 *         patient_info:
 *           type: object
 *           description: Thông tin bệnh nhân liên quan
 *           properties:
 *             name:
 *               type: string
 *               description: Tên bệnh nhân
 *               example: "Nguyễn Văn A"
 *             relationship:
 *               type: string
 *               description: Mối quan hệ (Father, Mother, Child, etc.)
 *               example: "Father"
 *             age:
 *               type: number
 *               description: Tuổi bệnh nhân
 *               example: 35
 *             gender:
 *               type: string
 *               enum: [male, female, other]
 *               description: Giới tính
 *               example: "male"
 *         collected_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian lấy mẫu
 *           example: "2024-01-01T09:00:00.000Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo record mẫu
 *           example: "2024-01-01T08:30:00.000Z"
 *     
 *     # ================== ERROR SCHEMAS ==================
 *     ErrorResponse:
 *       type: object
 *       description: Schema chuẩn cho phản hồi lỗi
 *       properties:
 *         success:
 *           type: boolean
 *           description: Luôn false khi có lỗi
 *           example: false
 *         message:
 *           type: string
 *           description: Thông báo lỗi chính
 *           example: "Payment not found"
 *         error:
 *           type: string
 *           description: Chi tiết lỗi hoặc mã lỗi
 *           example: "No payment found with the provided ID"
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *           example: 404
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Thời gian xảy ra lỗi
 *           example: "2024-01-01T10:00:00.000Z"
 *     
 *     ValidationErrorResponse:
 *       type: object
 *       description: Schema lỗi validation cho dữ liệu đầu vào
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: Tên trường bị lỗi
 *                 example: "appointment_id"
 *               message:
 *                 type: string
 *                 description: Thông báo lỗi cho trường này
 *                 example: "ID lịch hẹn không được để trống"
 *               value:
 *                 description: Giá trị bị lỗi
 *                 example: ""
 *         statusCode:
 *           type: integer
 *           example: 400
 *     
 *     # ================== SUCCESS RESPONSE WRAPPERS ==================
 *     SuccessResponse:
 *       type: object
 *       description: Schema wrapper cho phản hồi thành công
 *       properties:
 *         success:
 *           type: boolean
 *           description: Luôn true khi thành công
 *           example: true
 *         data:
 *           description: Dữ liệu thực tế được trả về
 *         message:
 *           type: string
 *           description: Thông báo thành công
 *           example: "Operation completed successfully"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Thời gian xử lý
 *           example: "2024-01-01T10:00:00.000Z"
 *     
 *     PaginatedResponse:
 *       type: object
 *       description: Schema cho phản hồi có phân trang
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           description: Mảng dữ liệu cho trang hiện tại
 *         pagination:
 *           type: object
 *           properties:
 *             current_page:
 *               type: integer
 *               description: Trang hiện tại
 *               example: 1
 *             total_pages:
 *               type: integer
 *               description: Tổng số trang
 *               example: 5
 *             page_size:
 *               type: integer
 *               description: Số item mỗi trang
 *               example: 10
 *             total_items:
 *               type: integer
 *               description: Tổng số item
 *               example: 47
 *             has_next:
 *               type: boolean
 *               description: Có trang tiếp theo không
 *               example: true
 *             has_prev:
 *               type: boolean
 *               description: Có trang trước không
 *               example: false
 *         message:
 *           type: string
 *           example: "Data retrieved successfully"
 */ 