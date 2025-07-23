/**
 * @swagger
 * /api/payments/webhook/payos:
 *   post:
 *     tags:
 *       - payment
 *     summary: Webhook xử lý callback từ PayOS
 *     description: |
 *       Endpoint nhận và xử lý webhook từ cổng thanh toán PayOS khi có thay đổi trạng thái thanh toán.
 *       
 *       **Quy trình xử lý webhook:**
 *       1. Xác thực chữ ký webhook bằng HMAC-SHA256
 *       2. Kiểm tra thanh toán tồn tại và số tiền khớp
 *       3. Cập nhật trạng thái thanh toán và lịch hẹn liên quan
 *       4. Tạo hoặc cập nhật giao dịch cho từng mẫu xét nghiệm
 *       5. Gửi email thông báo dựa trên trạng thái thanh toán
 *       
 *       **Lưu ý bảo mật:**
 *       - Endpoint này chỉ dành cho PayOS system
 *       - Không được gọi trực tiếp từ client
 *       - Yêu cầu chữ ký hợp lệ từ PayOS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentWebhookRequest'
 *     responses:
 *       '200':
 *         description: Webhook được xử lý thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook processed successfully"
 *       '400':
 *         description: Dữ liệu webhook không hợp lệ (chữ ký sai, không tìm thấy thanh toán, số tiền không khớp)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Lỗi máy chủ nội bộ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/test-webhook-signature:
 *   post:
 *     tags:
 *       - payment
 *     summary: Tạo chữ ký webhook test (chỉ development)
 *     description: |
 *       Endpoint hỗ trợ developer test tích hợp webhook PayOS trong môi trường development.
 *       
 *       **Tính năng:**
 *       - Tạo chữ ký HMAC-SHA256 cho dữ liệu test
 *       - Giúp kiểm tra logic xử lý webhook
 *       - Chỉ hoạt động trong môi trường development
 *       
 *       **Hạn chế:**
 *       - Không khả dụng trên production (trả về 403 Forbidden)
 *       - Chỉ dành cho mục đích testing và debugging
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Dữ liệu test để tạo chữ ký webhook
 *             properties:
 *               payment_no:
 *                 type: string
 *                 example: "TEST_PAY_123456"
 *                 description: Mã thanh toán test
 *               amount:
 *                 type: number
 *                 example: 50000
 *                 description: Số tiền test (VND)
 *               status:
 *                 type: string
 *                 enum: [PAID, CANCELLED, PENDING]
 *                 example: "PAID"
 *                 description: Trạng thái thanh toán test
 *     responses:
 *       '200':
 *         description: Chữ ký test được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     signature:
 *                       type: string
 *                       description: Chữ ký HMAC-SHA256 được tạo
 *                     data:
 *                       type: object
 *                       description: Dữ liệu gốc được ký
 *                     signedData:
 *                       type: object
 *                       description: Dữ liệu kèm chữ ký hoàn chỉnh
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Test signature generated successfully"
 *       '403':
 *         description: Không khả dụng trên production
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '400':
 *         description: Không có dữ liệu test được cung cấp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/return/payos:
 *   get:
 *     tags:
 *       - payment
 *     summary: Xử lý return URL từ PayOS
 *     description: |
 *       Endpoint xử lý khi người dùng hoàn thành thanh toán và được PayOS redirect về website.
 *       
 *       **Quy trình xử lý:**
 *       1. Nhận orderCode từ query parameters
 *       2. Tìm thanh toán trong database theo orderCode
 *       3. Verify trạng thái thanh toán với PayOS API
 *       4. Redirect người dùng đến frontend với thông tin kết quả
 *       
 *       **Lưu ý:**
 *       - Endpoint này được PayOS gọi tự động
 *       - Không nên gọi trực tiếp từ ứng dụng
 *       - Luôn redirect về frontend với thông tin thanh toán
 *     parameters:
 *       - name: orderCode
 *         in: query
 *         required: true
 *         description: Mã đơn hàng từ PayOS
 *         schema:
 *           type: string
 *           example: "123456789"
 *       - name: code
 *         in: query
 *         description: Mã kết quả từ PayOS
 *         schema:
 *           type: string
 *           example: "00"
 *       - name: id
 *         in: query
 *         description: ID giao dịch PayOS
 *         schema:
 *           type: string
 *           example: "payos_txn_123456"
 *     responses:
 *       '302':
 *         description: Redirect đến frontend với thông tin kết quả thanh toán
 *         headers:
 *           Location:
 *             description: URL frontend kèm thông tin thanh toán
 *             schema:
 *               type: string
 *               example: "https://frontend.com/payos?code=00&id=payos_123&orderCode=123456&status=completed"
 *       '400':
 *         description: Thiếu orderCode trong query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing orderCode"
 *       '404':
 *         description: Không tìm thấy thanh toán với orderCode được cung cấp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment not found"
 */

/**
 * @swagger
 * /api/payments/appointment:
 *   post:
 *     tags:
 *       - payment
 *     summary: Tạo thanh toán cho lịch hẹn xét nghiệm DNA (Deposit/Remaining Flow)
 *     description: |
 *       Tạo giao dịch thanh toán cho một lịch hẹn xét nghiệm DNA với luồng đặt cọc trước.
 *       
 *       **Luồng thanh toán mới:**
 *       1. **Đặt cọc (DEPOSIT)**: Khách hàng đặt cọc 30% tổng giá trị dịch vụ
 *       2. **Thanh toán còn lại (REMAINING)**: Sau khi đặt cọc, thanh toán số tiền còn lại
 *       
 *       **Tự động xác định giai đoạn:**
 *       - Nếu amount_paid = 0 → Tạo thanh toán DEPOSIT
 *       - Nếu amount_paid >= deposit_amount → Tạo thanh toán REMAINING
 *       - Nếu amount_paid >= total_amount → Báo lỗi đã thanh toán đủ
 *       
 *       **Tính năng chính:**
 *       - Hỗ trợ thanh toán tiền mặt (CASH) và online (PAY_OS)
 *       - Tự động tính toán số tiền theo giai đoạn
 *       - Tạo link thanh toán PayOS cho thanh toán online
 *       - Cập nhật trạng thái appointment sau mỗi thanh toán
 *       - Gửi email thông báo theo từng giai đoạn
 *       
 *       **Payment Stages:**
 *       - DEPOSIT: Đặt cọc 30% tổng giá trị
 *       - REMAINING: Thanh toán số tiền còn lại
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointment_id
 *               - payment_method
 *             properties:
 *               appointment_id:
 *                 type: string
 *                 description: ID của lịch hẹn cần thanh toán
 *                 example: "64a1b2c3d4e5f6789abcdef0"
 *               payment_method:
 *                 type: string
 *                 enum: [cash, pay_os]
 *                 description: Phương thức thanh toán
 *                 example: "pay_os"
 *               sample_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs của các mẫu xét nghiệm (tùy chọn, mặc định lấy tất cả)
 *                 example: ["64a1b2c3d4e5f6789abcdef1", "64a1b2c3d4e5f6789abcdef2"]
 *           examples:
 *             deposit_payos:
 *               summary: Đặt cọc qua PayOS
 *               value:
 *                 appointment_id: "64a1b2c3d4e5f6789abcdef0"
 *                 payment_method: "pay_os"
 *             remaining_cash:
 *               summary: Thanh toán còn lại bằng tiền mặt
 *               value:
 *                 appointment_id: "64a1b2c3d4e5f6789abcdef0"
 *                 payment_method: "cash"
 *     responses:
 *       '200':
 *         description: Thanh toán được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment_no:
 *                       type: string
 *                       example: "PAY-DEPOSIT-ABC123-101530"
 *                       description: Mã số thanh toán (bao gồm giai đoạn)
 *                     payment_method:
 *                       type: string
 *                       example: "pay_os"
 *                       description: Phương thức thanh toán
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                       description: Trạng thái thanh toán
 *                     amount:
 *                       type: number
 *                       example: 150000
 *                       description: Số tiền thanh toán (VND)
 *                     payment_stage:
 *                       type: string
 *                       example: "deposit"
 *                       enum: [deposit, remaining]
 *                       description: Giai đoạn thanh toán
 *                     checkout_url:
 *                       type: string
 *                       example: "https://pay.payos.vn/web/payment/123456"
 *                       description: Link thanh toán PayOS (chỉ có khi payment_method = pay_os)
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Deposit payment created successfully"
 *             examples:
 *               deposit_payos_success:
 *                 summary: Tạo đặt cọc PayOS thành công
 *                 value:
 *                   data:
 *                     payment_no: "PAY-DEPOSIT-ABC123-101530"
 *                     payment_method: "pay_os"
 *                     status: "pending"
 *                     amount: 150000
 *                     payment_stage: "deposit"
 *                     checkout_url: "https://pay.payos.vn/web/payment/123456"
 *                   success: true
 *                   message: "Deposit payment created successfully"
 *               remaining_cash_success:
 *                 summary: Tạo thanh toán còn lại bằng tiền mặt thành công
 *                 value:
 *                   data:
 *                     payment_no: "PAY-REMAINING-DEF456-143020"
 *                     payment_method: "cash"
 *                     status: "completed"
 *                     amount: 350000
 *                     payment_stage: "remaining"
 *                   success: true
 *                   message: "Remaining payment completed successfully"
 *       '400':
 *         description: Dữ liệu đầu vào không hợp lệ hoặc trạng thái thanh toán không phù hợp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               already_paid:
 *                 summary: Đã thanh toán đủ
 *                 value:
 *                   success: false
 *                   message: "Appointment already fully paid"
 *                   statusCode: 400
 *               pending_payment_exists:
 *                 summary: Đã có thanh toán đang chờ cho giai đoạn này
 *                 value:
 *                   success: false
 *                   message: "A pending deposit payment already exists for this appointment"
 *                   statusCode: 400
 *               invalid_payment_state:
 *                 summary: Trạng thái thanh toán không hợp lệ
 *                 value:
 *                   success: false
 *                   message: "Invalid payment state"
 *                   statusCode: 400
 *       '401':
 *         description: Chưa xác thực người dùng hoặc token không hợp lệ
 *       '403':
 *         description: Không có quyền truy cập lịch hẹn này
 *       '404':
 *         description: Không tìm thấy lịch hẹn hoặc dịch vụ
 */

/**
 * @swagger
 * /api/payments/{paymentNo}/verify:
 *   get:
 *     tags:
 *       - payment
 *     summary: Xác minh trạng thái thanh toán với PayOS
 *     description: |
 *       Kiểm tra và cập nhật trạng thái thanh toán bằng cách gọi API PayOS.
 *       
 *       **Quy trình xác minh:**
 *       1. Tìm thanh toán trong database theo payment number
 *       2. Gọi API PayOS để lấy trạng thái mới nhất
 *       3. So sánh và cập nhật trạng thái trong database
 *       4. Cập nhật trạng thái lịch hẹn nếu thanh toán hoàn thành
 *       5. Trả về thông tin chi tiết thanh toán
 *       
 *       **Sử dụng khi:**
 *       - Người dùng muốn kiểm tra trạng thái thanh toán thủ công
 *       - Đồng bộ trạng thái khi webhook bị miss
 *       - Troubleshooting vấn đề thanh toán
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: paymentNo
 *         in: path
 *         required: true
 *         description: Mã số thanh toán cần xác minh
 *         schema:
 *           type: string
 *           example: "PAY_123456789"
 *     responses:
 *       '200':
 *         description: Xác minh thanh toán hoàn tất
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment_status:
 *                       type: string
 *                       enum: [pending, completed, cancelled, failed]
 *                       description: Trạng thái thanh toán sau khi xác minh
 *                       example: "completed"
 *                     payment_info:
 *                       $ref: '#/components/schemas/PaymentResponse'
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment verification completed"
 *             examples:
 *               completed_payment:
 *                 summary: Thanh toán đã hoàn thành
 *                 value:
 *                   data:
 *                     payment_status: "completed"
 *                     payment_info:
 *                       id: "64a1b2c3d4e5f6789abcdef0"
 *                       payment_no: "PAY_123456789"
 *                       amount: 500000
 *                       status: "completed"
 *                       payment_method: "pay_os"
 *                   success: true
 *                   message: "Payment verification completed"
 *               pending_payment:
 *                 summary: Thanh toán đang chờ
 *                 value:
 *                   data:
 *                     payment_status: "pending"
 *                     payment_info:
 *                       id: "64a1b2c3d4e5f6789abcdef0"
 *                       payment_no: "PAY_123456789"
 *                       amount: 500000
 *                       status: "pending"
 *                       payment_method: "pay_os"
 *                   success: true
 *                   message: "Payment verification completed"
 *       '404':
 *         description: Không tìm thấy thanh toán với mã số được cung cấp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Lỗi khi gọi API PayOS hoặc lỗi máy chủ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/status/{orderCode}:
 *   get:
 *     tags:
 *       - payment
 *     summary: Lấy trạng thái chi tiết thanh toán theo mã đơn hàng
 *     description: |
 *       Endpoint lấy thông tin chi tiết và trạng thái hiện tại của thanh toán dựa trên orderCode.
 *       
 *       **Tính năng chính:**
 *       - Tìm thanh toán theo orderCode trong database
 *       - Xác minh trạng thái hiện tại với PayOS API
 *       - Trả về thông tin thanh toán, kết quả xác minh và thông tin lịch hẹn
 *       - Không yêu cầu authentication (dành cho frontend verification)
 *       
 *       **Use cases:**
 *       - Frontend verification sau khi PayOS redirect
 *       - Kiểm tra trạng thái thanh toán real-time
 *       - Hiển thị thông tin chi tiết cho người dùng
 *       - Debugging và troubleshooting
 *       
 *       **Lưu ý bảo mật:**
 *       - Endpoint public, không cần authentication
 *       - Chỉ trả về thông tin cần thiết cho frontend
 *       - Luôn verify với PayOS để đảm bảo tính chính xác
 *     parameters:
 *       - name: orderCode
 *         in: path
 *         required: true
 *         description: Mã đơn hàng PayOS để tìm kiếm thanh toán
 *         schema:
 *           type: string
 *           example: "123456789"
 *     responses:
 *       '200':
 *         description: Lấy thông tin trạng thái thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       type: object
 *                       description: Thông tin cơ bản của thanh toán
 *                       properties:
 *                         payment_no:
 *                           type: string
 *                           description: Mã số thanh toán nội bộ
 *                           example: "PAY_123456789"
 *                         amount:
 *                           type: number
 *                           description: Số tiền thanh toán (VND)
 *                           example: 500000
 *                         payment_method:
 *                           type: string
 *                           description: Phương thức thanh toán
 *                           example: "PAY_OS"
 *                         status:
 *                           type: string
 *                           description: Trạng thái thanh toán trong database
 *                           example: "completed"
 *                         payos_order_code:
 *                           type: number
 *                           description: Mã đơn hàng PayOS
 *                           example: 123456789
 *                         payos_web_id:
 *                           type: string
 *                           description: ID web thanh toán PayOS
 *                           example: "web_123456"
 *                         payos_payment_url:
 *                           type: string
 *                           description: URL thanh toán PayOS
 *                           example: "https://pay.payos.vn/web/payment/123456"
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           description: Thời gian tạo thanh toán
 *                           example: "2024-01-01T10:00:00.000Z"
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                           description: Thời gian cập nhật gần nhất
 *                           example: "2024-01-01T10:30:00.000Z"
 *                     verification:
 *                       type: object
 *                       description: Kết quả xác minh với PayOS API
 *                       properties:
 *                         payment_status:
 *                           type: string
 *                           description: Trạng thái thanh toán sau khi verify
 *                           enum: [pending, processing, completed, cancelled, failed]
 *                           example: "completed"
 *                         appointment_id:
 *                           type: string
 *                           description: ID lịch hẹn liên quan
 *                           example: "64a1b2c3d4e5f6789abcdef1"
 *                         paymentNo:
 *                           type: string
 *                           description: Mã số thanh toán
 *                           example: "PAY_123456789"
 *                         payos_status:
 *                           type: string
 *                           description: Trạng thái từ PayOS API
 *                           example: "PAID"
 *                         last_verified_at:
 *                           type: string
 *                           format: date-time
 *                           description: Thời gian xác minh gần nhất
 *                           example: "2024-01-01T10:30:00.000Z"
 *                     appointment:
 *                       type: object
 *                       nullable: true
 *                       description: Thông tin lịch hẹn liên quan (nếu có)
 *                       properties:
 *                         appointment_id:
 *                           type: string
 *                           description: ID của lịch hẹn
 *                           example: "64a1b2c3d4e5f6789abcdef1"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Thời gian tạo response
 *                       example: "2024-01-01T10:30:05.000Z"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment status retrieved successfully"
 *             examples:
 *               completed_payment:
 *                 summary: Thanh toán hoàn thành
 *                 value:
 *                   data:
 *                     payment:
 *                       payment_no: "PAY_123456789"
 *                       amount: 500000
 *                       payment_method: "PAY_OS"
 *                       status: "completed"
 *                       payos_order_code: 123456789
 *                       payos_web_id: "web_123456"
 *                       payos_payment_url: "https://pay.payos.vn/web/payment/123456"
 *                       created_at: "2024-01-01T10:00:00.000Z"
 *                       updated_at: "2024-01-01T10:30:00.000Z"
 *                     verification:
 *                       payment_status: "completed"
 *                       appointment_id: "64a1b2c3d4e5f6789abcdef1"
 *                       paymentNo: "PAY_123456789"
 *                       payos_status: "PAID"
 *                       last_verified_at: "2024-01-01T10:30:00.000Z"
 *                     appointment:
 *                       appointment_id: "64a1b2c3d4e5f6789abcdef1"
 *                     timestamp: "2024-01-01T10:30:05.000Z"
 *                   success: true
 *                   message: "Payment status retrieved successfully"
 *               pending_payment:
 *                 summary: Thanh toán đang chờ
 *                 value:
 *                   data:
 *                     payment:
 *                       payment_no: "PAY_123456790"
 *                       amount: 300000
 *                       payment_method: "PAY_OS"
 *                       status: "pending"
 *                       payos_order_code: 123456790
 *                       payos_web_id: "web_123457"
 *                       payos_payment_url: "https://pay.payos.vn/web/payment/123457"
 *                       created_at: "2024-01-01T10:00:00.000Z"
 *                       updated_at: "2024-01-01T10:00:00.000Z"
 *                     verification:
 *                       payment_status: "pending"
 *                       appointment_id: "64a1b2c3d4e5f6789abcdef2"
 *                       paymentNo: "PAY_123456790"
 *                       payos_status: "PENDING"
 *                       last_verified_at: "2024-01-01T10:30:05.000Z"
 *                     appointment:
 *                       appointment_id: "64a1b2c3d4e5f6789abcdef2"
 *                     timestamp: "2024-01-01T10:30:05.000Z"
 *                   success: true
 *                   message: "Payment status retrieved successfully"
 *               cancelled_payment:
 *                 summary: Thanh toán đã hủy
 *                 value:
 *                   data:
 *                     payment:
 *                       payment_no: "PAY_123456791"
 *                       amount: 200000
 *                       payment_method: "PAY_OS"
 *                       status: "cancelled"
 *                       payos_order_code: 123456791
 *                       payos_web_id: "web_123458"
 *                       payos_payment_url: "https://pay.payos.vn/web/payment/123458"
 *                       created_at: "2024-01-01T10:00:00.000Z"
 *                       updated_at: "2024-01-01T10:15:00.000Z"
 *                     verification:
 *                       payment_status: "cancelled"
 *                       appointment_id: "64a1b2c3d4e5f6789abcdef3"
 *                       paymentNo: "PAY_123456791"
 *                       payos_status: "CANCELLED"
 *                       last_verified_at: "2024-01-01T10:30:05.000Z"
 *                     appointment:
 *                       appointment_id: "64a1b2c3d4e5f6789abcdef3"
 *                     timestamp: "2024-01-01T10:30:05.000Z"
 *                   success: true
 *                   message: "Payment status retrieved successfully"
 *       '400':
 *         description: Thiếu orderCode trong request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Order code is required"
 *               error: "Missing required parameter: orderCode"
 *               statusCode: 400
 *               timestamp: "2024-01-01T10:30:00.000Z"
 *       '404':
 *         description: Không tìm thấy thanh toán với orderCode được cung cấp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Payment not found"
 *               error: "No payment found with orderCode: 123456789"
 *               statusCode: 404
 *               timestamp: "2024-01-01T10:30:00.000Z"
 *       '500':
 *         description: Lỗi máy chủ nội bộ hoặc lỗi khi gọi PayOS API
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server_error:
 *                 summary: Lỗi máy chủ nội bộ
 *                 value:
 *                   success: false
 *                   message: "Internal server error"
 *                   error: "Database connection failed"
 *                   statusCode: 500
 *                   timestamp: "2024-01-01T10:30:00.000Z"
 *               payos_api_error:
 *                 summary: Lỗi API PayOS
 *                 value:
 *                   success: false
 *                   message: "PayOS API verification failed"
 *                   error: "PayOS API returned error: Invalid order code"
 *                   statusCode: 500
 *                   timestamp: "2024-01-01T10:30:00.000Z"
 */

/**
 * @swagger
 * /api/payments/{paymentNo}/cancel:
 *   post:
 *     tags:
 *       - payment
 *     summary: Hủy thanh toán đang chờ xử lý
 *     description: |
 *       Hủy một giao dịch thanh toán đang ở trạng thái pending.
 *       
 *       **Quy tắc hủy thanh toán:**
 *       - Chỉ có thể hủy thanh toán có trạng thái 'pending'
 *       - Thanh toán đã hoàn thành, thất bại hoặc đã hủy không thể hủy lại
 *       - Thanh toán PAY_OS sẽ được hủy trên cổng thanh toán PayOS
 *       - Thanh toán CASH có thể hủy trực tiếp trong hệ thống
 *       
 *       **Hậu quả khi hủy:**
 *       - Trạng thái thanh toán chuyển thành 'cancelled'
 *       - Trạng thái lịch hẹn có thể được cập nhật
 *       - Link thanh toán PayOS (nếu có) sẽ không còn hiệu lực
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: paymentNo
 *         in: path
 *         required: true
 *         description: Mã số thanh toán cần hủy
 *         schema:
 *           type: string
 *           example: "PAY_123456789"
 *     responses:
 *       '200':
 *         description: Hủy thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     cancelled:
 *                       type: boolean
 *                       example: true
 *                       description: Xác nhận thanh toán đã được hủy
 *                     payment_no:
 *                       type: string
 *                       example: "PAY_123456789"
 *                       description: Mã số thanh toán đã hủy
 *                     previous_status:
 *                       type: string
 *                       example: "pending"
 *                       description: Trạng thái trước khi hủy
 *                     cancelled_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T10:30:00.000Z"
 *                       description: Thời gian hủy thanh toán
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment cancelled successfully"
 *       '400':
 *         description: Không thể hủy thanh toán (đã hoàn thành, đã hủy, hoặc thất bại)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               already_completed:
 *                 summary: Thanh toán đã hoàn thành
 *                 value:
 *                   success: false
 *                   message: "Cannot cancel completed payment"
 *                   error: "Payment status: completed"
 *               already_cancelled:
 *                 summary: Thanh toán đã bị hủy
 *                 value:
 *                   success: false
 *                   message: "Payment already cancelled"
 *                   error: "Payment status: cancelled"
 *       '404':
 *         description: Không tìm thấy thanh toán với mã số được cung cấp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/success:
 *   get:
 *     tags:
 *       - payment
 *     summary: Xử lý callback thành công từ PayOS
 *     description: |
 *       Endpoint xử lý khi thanh toán thành công và PayOS redirect người dùng về website.
 *       
 *       **Quy trình xử lý success callback:**
 *       1. Nhận orderCode và thông tin thanh toán từ query parameters
 *       2. Verify trạng thái thanh toán thực tế với PayOS API
 *       3. Xác định trang đích dựa trên kết quả verify:
 *          - Success: Redirect đến trang thành công
 *          - Pending: Redirect đến trang đang xử lý
 *          - Failed: Redirect đến trang thất bại
 *       
 *       **Các trường hợp redirect:**
 *       - Thanh toán hoàn thành → Success page
 *       - Thanh toán đang chờ → Pending page  
 *       - Thanh toán thất bại → Failed page
 *       - Lỗi xác minh → Error page
 *     parameters:
 *       - name: orderCode
 *         in: query
 *         required: true
 *         description: Mã đơn hàng từ PayOS callback
 *         schema:
 *           type: string
 *           example: "123456789"
 *       - name: amount
 *         in: query
 *         description: Số tiền thanh toán từ PayOS
 *         schema:
 *           type: string
 *           example: "500000"
 *       - name: status
 *         in: query
 *         description: Trạng thái từ PayOS callback
 *         schema:
 *           type: string
 *           example: "PAID"
 *     responses:
 *       '302':
 *         description: Redirect đến trang kết quả phù hợp trên frontend
 *         headers:
 *           Location:
 *             description: URL trang đích với thông tin thanh toán
 *             schema:
 *               type: string
 *             examples:
 *               success_redirect:
 *                 summary: Redirect đến trang thành công
 *                 value: "https://frontend.com/payments/success?orderCode=123456&status=success"
 *               pending_redirect:
 *                 summary: Redirect đến trang đang xử lý
 *                 value: "https://frontend.com/payments/pending?orderCode=123456"
 *               failed_redirect:
 *                 summary: Redirect đến trang thất bại
 *                 value: "https://frontend.com/payments/failed?orderCode=123456&status=failed"
 */

/**
 * @swagger
 * /api/payments/failure:
 *   get:
 *     tags:
 *       - payment
 *     summary: Xử lý callback thất bại từ PayOS
 *     description: |
 *       Endpoint xử lý khi thanh toán thất bại, bị hủy hoặc gặp lỗi và PayOS redirect về.
 *       
 *       **Quy trình xử lý failure callback:**
 *       1. Nhận orderCode từ query parameters (nếu có)
 *       2. Tự động hủy thanh toán nếu orderCode được cung cấp
 *       3. Log thông tin lỗi để phục vụ debugging
 *       4. Redirect người dùng đến trang thông báo lỗi trên frontend
 *       
 *       **Các nguyên nhân thất bại:**
 *       - Người dùng hủy thanh toán
 *       - Thẻ/tài khoản không đủ số dư
 *       - Lỗi kết nối với ngân hàng
 *       - Timeout trong quá trình thanh toán
 *       - Lỗi hệ thống PayOS
 *     parameters:
 *       - name: orderCode
 *         in: query
 *         description: Mã đơn hàng (nếu có từ PayOS callback)
 *         schema:
 *           type: string
 *           example: "123456789"
 *       - name: code
 *         in: query
 *         description: Mã lỗi từ PayOS
 *         schema:
 *           type: string
 *           example: "CANCELLED"
 *       - name: desc
 *         in: query
 *         description: Mô tả lỗi từ PayOS
 *         schema:
 *           type: string
 *           example: "Payment cancelled by user"
 *     responses:
 *       '302':
 *         description: Redirect đến trang thông báo lỗi trên frontend
 *         headers:
 *           Location:
 *             description: URL trang lỗi với thông tin chi tiết
 *             schema:
 *               type: string
 *             examples:
 *               cancelled_redirect:
 *                 summary: Redirect khi người dùng hủy
 *                 value: "https://frontend.com/payments/failed?orderCode=123456&status=cancelled"
 *               error_redirect:
 *                 summary: Redirect khi có lỗi hệ thống
 *                 value: "https://frontend.com/payments/failed?error=internal"
 *               unknown_redirect:
 *                 summary: Redirect khi không xác định được lỗi
 *                 value: "https://frontend.com/payments/failed?orderCode=unknown&status=cancelled"
 */

/**
 * @swagger
 * /api/payments/{paymentId}/samples:
 *   get:
 *     tags:
 *       - payment
 *     summary: Lấy danh sách mẫu xét nghiệm của thanh toán
 *     description: |
 *       Lấy thông tin chi tiết các mẫu xét nghiệm liên quan đến một thanh toán cụ thể.
 *       
 *       **Thông tin trả về cho mỗi mẫu:**
 *       - ID và thông tin cơ bản của mẫu
 *       - Loại mẫu xét nghiệm (máu, nước bọt, etc.)
 *       - Loại xét nghiệm DNA được thực hiện
 *       - Giá tiền cho từng mẫu
 *       - Trạng thái xử lý mẫu hiện tại
 *       - Thông tin bệnh nhân liên quan
 *       
 *       **Sử dụng khi:**
 *       - Hiển thị chi tiết hóa đơn thanh toán
 *       - Theo dõi tiến độ xử lý mẫu
 *       - Xuất báo cáo thanh toán chi tiết
 *       - Xác minh thông tin trước khi xử lý mẫu
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: paymentId
 *         in: path
 *         required: true
 *         description: ID thanh toán cần lấy thông tin mẫu
 *         schema:
 *           type: string
 *           example: "64a1b2c3d4e5f6789abcdef0"
 *     responses:
 *       '200':
 *         description: Lấy danh sách mẫu xét nghiệm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sample_id:
 *                         type: string
 *                         description: ID duy nhất của mẫu xét nghiệm
 *                         example: "64a1b2c3d4e5f6789abcdef1"
 *                       sample_code:
 *                         type: string
 *                         description: Mã mẫu để theo dõi
 *                         example: "DNA_SAMPLE_001"
 *                       sample_type:
 *                         type: string
 *                         description: Loại mẫu xét nghiệm
 *                         enum: [blood, saliva, hair, tissue]
 *                         example: "blood"
 *                       test_type:
 *                         type: string
 *                         description: Loại xét nghiệm DNA
 *                         example: "Paternity Test"
 *                       amount:
 *                         type: number
 *                         description: Giá tiền cho mẫu này (VND)
 *                         example: 250000
 *                       status:
 *                         type: string
 *                         description: Trạng thái xử lý mẫu
 *                         enum: [pending, processing, completed, failed]
 *                         example: "pending"
 *                       patient_info:
 *                         type: object
 *                         description: Thông tin bệnh nhân liên quan
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Nguyễn Văn A"
 *                           relationship:
 *                             type: string
 *                             example: "Father"
 *                       collected_at:
 *                         type: string
 *                         format: date-time
 *                         description: Thời gian lấy mẫu
 *                         example: "2024-01-01T09:00:00.000Z"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Thời gian tạo record mẫu
 *                         example: "2024-01-01T08:30:00.000Z"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Samples retrieved successfully"
 *             examples:
 *               paternity_test_samples:
 *                 summary: Mẫu xét nghiệm huyết thống
 *                 value:
 *                   data:
 *                     - sample_id: "64a1b2c3d4e5f6789abcdef1"
 *                       sample_code: "DNA_PAT_001_FATHER"
 *                       sample_type: "blood"
 *                       test_type: "Paternity Test"
 *                       amount: 250000
 *                       status: "pending"
 *                       patient_info:
 *                         name: "Nguyễn Văn A"
 *                         relationship: "Father"
 *                       collected_at: "2024-01-01T09:00:00.000Z"
 *                     - sample_id: "64a1b2c3d4e5f6789abcdef2"
 *                       sample_code: "DNA_PAT_001_CHILD"
 *                       sample_type: "saliva"
 *                       test_type: "Paternity Test"
 *                       amount: 250000
 *                       status: "pending"
 *                       patient_info:
 *                         name: "Nguyễn Văn B"
 *                         relationship: "Child"
 *                       collected_at: "2024-01-01T09:15:00.000Z"
 *                   success: true
 *                   message: "Samples retrieved successfully"
 *       '404':
 *         description: Không tìm thấy thanh toán hoặc không có mẫu nào liên quan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               payment_not_found:
 *                 summary: Không tìm thấy thanh toán
 *                 value:
 *                   success: false
 *                   message: "Payment not found"
 *                   error: "No payment found with the provided ID"
 *               no_samples:
 *                 summary: Thanh toán không có mẫu
 *                 value:
 *                   success: false
 *                   message: "No samples found for this payment"
 *                   error: "Payment exists but no associated samples"
 *       '500':
 *         description: Lỗi máy chủ khi truy xuất thông tin mẫu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/{paymentId}/transactions:
 *   get:
 *     tags:
 *       - payment
 *     summary: Lấy lịch sử giao dịch của một thanh toán
 *     description: |
 *       Lấy thông tin chi tiết về tất cả các giao dịch (transactions) liên quan đến một thanh toán cụ thể.
 *       
 *       **Thông tin transaction bao gồm:**
 *       - Receipt number (mã hóa đơn)
 *       - Sample information (thông tin mẫu xét nghiệm)
 *       - Customer information (thông tin khách hàng)
 *       - PayOS transaction details (chi tiết giao dịch PayOS)
 *       - Transaction status và timestamps
 *       
 *       **Use cases:**
 *       - Audit trail cho từng thanh toán
 *       - Troubleshooting payment issues
 *       - Báo cáo tài chính chi tiết
 *       - Xác minh giao dịch với PayOS
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: paymentId
 *         in: path
 *         required: true
 *         description: ID của thanh toán cần xem lịch sử giao dịch
 *         schema:
 *           type: string
 *           example: "64a1b2c3d4e5f6789abcdef0"
 *     responses:
 *       '200':
 *         description: Lịch sử giao dịch được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64a1b2c3d4e5f6789abcdef3"
 *                         description: "ID của transaction"
 *                       payment_id:
 *                         type: string
 *                         example: "64a1b2c3d4e5f6789abcdef0"
 *                         description: "ID của payment liên quan"
 *                       receipt_number:
 *                         type: string
 *                         example: "PAY-DEPOSIT-ABC123-101530-DEPOSIT-64a1b2"
 *                         description: "Số hóa đơn duy nhất"
 *                       sample_id:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6789abcdef1"
 *                           sample_code:
 *                             type: string
 *                             example: "DNA_SAMPLE_001"
 *                           sample_type:
 *                             type: string
 *                             example: "blood"
 *                       customer_id:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6789abcdef2"
 *                           first_name:
 *                             type: string
 *                             example: "Nguyễn"
 *                           last_name:
 *                             type: string
 *                             example: "Văn A"
 *                           email:
 *                             type: string
 *                             example: "nguyenvana@example.com"
 *                       payos_transaction_id:
 *                         type: string
 *                         example: "payos_txn_123456"
 *                         description: "ID giao dịch từ PayOS"
 *                       payos_payment_status:
 *                         type: string
 *                         enum: [pending, success, failed, cancelled, refunded]
 *                         example: "success"
 *                         description: "Trạng thái giao dịch PayOS"
 *                       transaction_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                         description: "Thời gian giao dịch"
 *                       payos_payment_status_time:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:31:00.000Z"
 *                         description: "Thời gian cập nhật trạng thái PayOS"
 *                       payos_webhook_received_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:31:05.000Z"
 *                         description: "Thời gian nhận webhook từ PayOS"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:31:05.000Z"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment transactions retrieved successfully"
 *       '400':
 *         description: Thiếu Payment ID trong request
 *       '404':
 *         description: Không tìm thấy thanh toán hoặc không có giao dịch nào
 *       '500':
 *         description: Lỗi máy chủ nội bộ
 */

/**
 * @swagger
 * /api/payments/appointment/{appointmentId}/transactions:
 *   get:
 *     tags:
 *       - payment
 *     summary: Lấy toàn bộ lịch sử giao dịch của một lịch hẹn
 *     description: |
 *       Lấy thông tin chi tiết về tất cả các giao dịch liên quan đến một lịch hẹn, 
 *       bao gồm cả DEPOSIT và REMAINING payments.
 *       
 *       **Thông tin bao gồm:**
 *       - Tất cả transactions từ các payments của appointment
 *       - Thông tin payment stage (deposit/remaining)
 *       - Chi tiết từng sample và customer
 *       - Trạng thái PayOS và timeline
 *       - Audit trail hoàn chỉnh
 *       
 *       **Use cases:**
 *       - Dashboard khách hàng xem lịch sử đầy đủ
 *       - Staff review toàn bộ payment flow
 *       - Báo cáo tài chính appointment
 *       - Troubleshooting payment issues
 *       - Compliance và audit
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: appointmentId
 *         in: path
 *         required: true
 *         description: ID của lịch hẹn cần xem lịch sử giao dịch
 *         schema:
 *           type: string
 *           example: "64a1b2c3d4e5f6789abcdef0"
 *     responses:
 *       '200':
 *         description: Lịch sử giao dịch appointment được lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64a1b2c3d4e5f6789abcdef3"
 *                       payment_id:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6789abcdef4"
 *                           payment_no:
 *                             type: string
 *                             example: "PAY-DEPOSIT-ABC123-101530"
 *                           payment_stage:
 *                             type: string
 *                             enum: [deposit, remaining]
 *                             example: "deposit"
 *                           amount:
 *                             type: number
 *                             example: 150000
 *                           payment_method:
 *                             type: string
 *                             example: "pay_os"
 *                           status:
 *                             type: string
 *                             example: "completed"
 *                       receipt_number:
 *                         type: string
 *                         example: "PAY-DEPOSIT-ABC123-101530-DEPOSIT-64a1b2"
 *                       sample_id:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6789abcdef1"
 *                           sample_code:
 *                             type: string
 *                             example: "DNA_SAMPLE_001"
 *                           sample_type:
 *                             type: string
 *                             example: "blood"
 *                       customer_id:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6789abcdef2"
 *                           first_name:
 *                             type: string
 *                             example: "Nguyễn"
 *                           last_name:
 *                             type: string
 *                             example: "Văn A"
 *                           email:
 *                             type: string
 *                             example: "nguyenvana@example.com"
 *                       payos_payment_status:
 *                         type: string
 *                         enum: [pending, success, failed, cancelled, refunded]
 *                         example: "success"
 *                       transaction_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:31:05.000Z"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Appointment transactions retrieved successfully"
 *             examples:
 *               complete_flow:
 *                 summary: Lịch sử đầy đủ deposit + remaining
 *                 value:
 *                   data:
 *                     - _id: "64a1b2c3d4e5f6789abcdef3"
 *                       payment_id:
 *                         _id: "64a1b2c3d4e5f6789abcdef4"
 *                         payment_no: "PAY-DEPOSIT-ABC123-101530"
 *                         payment_stage: "deposit"
 *                         amount: 150000
 *                         payment_method: "pay_os"
 *                         status: "completed"
 *                       receipt_number: "PAY-DEPOSIT-ABC123-101530-DEPOSIT-64a1b2"
 *                       sample_id:
 *                         _id: "64a1b2c3d4e5f6789abcdef1"
 *                         sample_code: "DNA_SAMPLE_001"
 *                         sample_type: "blood"
 *                       customer_id:
 *                         _id: "64a1b2c3d4e5f6789abcdef2"
 *                         first_name: "Nguyễn"
 *                         last_name: "Văn A"
 *                         email: "nguyenvana@example.com"
 *                       payos_payment_status: "success"
 *                       transaction_date: "2024-01-15T10:30:00.000Z"
 *                       created_at: "2024-01-15T10:30:00.000Z"
 *                       updated_at: "2024-01-15T10:31:05.000Z"
 *                     - _id: "64a1b2c3d4e5f6789abcdef5"
 *                       payment_id:
 *                         _id: "64a1b2c3d4e5f6789abcdef6"
 *                         payment_no: "PAY-REMAINING-DEF456-143020"
 *                         payment_stage: "remaining"
 *                         amount: 350000
 *                         payment_method: "cash"
 *                         status: "completed"
 *                       receipt_number: "PAY-REMAINING-DEF456-143020-REMAINING-64a1b2"
 *                       sample_id:
 *                         _id: "64a1b2c3d4e5f6789abcdef1"
 *                         sample_code: "DNA_SAMPLE_001"
 *                         sample_type: "blood"
 *                       customer_id:
 *                         _id: "64a1b2c3d4e5f6789abcdef2"
 *                         first_name: "Nguyễn"
 *                         last_name: "Văn A"
 *                         email: "nguyenvana@example.com"
 *                       payos_payment_status: "success"
 *                       transaction_date: "2024-01-15T14:30:00.000Z"
 *                       created_at: "2024-01-15T14:30:00.000Z"
 *                       updated_at: "2024-01-15T14:30:00.000Z"
 *                   success: true
 *                   message: "Appointment transactions retrieved successfully"
 *       '400':
 *         description: Thiếu Appointment ID trong request
 *       '404':
 *         description: Không tìm thấy lịch hẹn hoặc không có giao dịch nào
 *       '500':
 *         description: Lỗi máy chủ nội bộ
 */

/**
 * @swagger
 * /api/payments/test-transaction-creation:
 *   get:
 *     tags:
 *       - payment
 *     summary: Test transaction creation functionality (development only)
 *     description: |
 *       Endpoint để test việc tạo transaction records trong môi trường development.
 *       
 *       **Tính năng test:**
 *       - Tạo mock payment và appointment data
 *       - Kiểm tra việc tạo transaction records
 *       - Verify transaction creation logic
 *       - Debug transaction-related issues
 *       
 *       **Hạn chế:**
 *       - Chỉ hoạt động trong môi trường development
 *       - Không khả dụng trên production (trả về 403 Forbidden)
 *       - Dành cho debugging và testing purposes
 *       
 *       **Test cases:**
 *       - Payment không có sample_ids → Tạo appointment-level transaction
 *       - Payment có sample_ids → Tạo transaction cho từng sample
 *       - Verify transaction data integrity
 *     responses:
 *       '200':
 *         description: Test transaction creation hoàn thành
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                       description: "Kết quả test"
 *                     message:
 *                       type: string
 *                       example: "Transaction creation test completed successfully"
 *                       description: "Thông báo kết quả"
 *                     details:
 *                       type: object
 *                       properties:
 *                         payment:
 *                           type: object
 *                           description: "Mock payment data được sử dụng"
 *                         appointment:
 *                           type: object
 *                           description: "Mock appointment data được sử dụng"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction creation test completed successfully"
 *             examples:
 *               successful_test:
 *                 summary: Test thành công
 *                 value:
 *                   data:
 *                     success: true
 *                     message: "Transaction creation test completed successfully"
 *                     details:
 *                       payment:
 *                         _id: "1705123456789"
 *                         payment_no: "TEST-PAY-1705123456789"
 *                         payment_stage: "deposit"
 *                         payment_method: "cash"
 *                         sample_ids: []
 *                       appointment:
 *                         _id: "1705123456790"
 *                         user_id: "1705123456791"
 *                   success: true
 *                   message: "Transaction creation test completed successfully"
 *               failed_test:
 *                 summary: Test thất bại
 *                 value:
 *                   data:
 *                     success: false
 *                     message: "Transaction creation test failed"
 *                     details:
 *                       error: "Database connection failed"
 *                       stack: "Error: Database connection failed\\n    at ..."
 *                   success: false
 *                   message: "Transaction creation test failed"
 *       '403':
 *         description: Không khả dụng trên production
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Test endpoint not available in production"
 *               statusCode: 403
 *       '500':
 *         description: Lỗi máy chủ nội bộ khi chạy test
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */ 