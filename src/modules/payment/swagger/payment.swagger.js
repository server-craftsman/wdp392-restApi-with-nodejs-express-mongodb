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
 *     summary: Tạo thanh toán cho lịch hẹn xét nghiệm DNA
 *     description: |
 *       Tạo giao dịch thanh toán cho một lịch hẹn xét nghiệm DNA với các mẫu được chọn.
 *       
 *       **Tính năng chính:**
 *       - Hỗ trợ thanh toán tiền mặt (CASH) và online (PAY_OS)
 *       - Tự động tính toán tổng tiền dựa trên các mẫu xét nghiệm
 *       - Hỗ trợ thanh toán một phần với custom_amount
 *       - Tạo link thanh toán PayOS cho thanh toán online
 *       - Tự động lấy tất cả mẫu nếu không chỉ định sample_ids
 *       
 *       **Quy trình thanh toán:**
 *       1. Xác thực người dùng và quyền truy cập lịch hẹn
 *       2. Lấy thông tin mẫu xét nghiệm và tính toán tổng tiền
 *       3. Tạo payment record trong database
 *       4. Tạo link PayOS nếu chọn thanh toán online
 *       5. Trả về thông tin thanh toán và link checkout
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentPaymentRequest'
 *           examples:
 *             payos_payment:
 *               summary: Thanh toán online qua PayOS
 *               value:
 *                 appointment_id: "64a1b2c3d4e5f6789abcdef0"
 *                 payment_method: "pay_os"
 *             cash_payment:
 *               summary: Thanh toán tiền mặt
 *               value:
 *                 appointment_id: "64a1b2c3d4e5f6789abcdef0"
 *                 payment_method: "cash"
 *             partial_payment:
 *               summary: Thanh toán một phần với mẫu được chọn
 *               value:
 *                 appointment_id: "64a1b2c3d4e5f6789abcdef0"
 *                 payment_method: "pay_os"
 *                 sample_ids: ["64a1b2c3d4e5f6789abcdef1", "64a1b2c3d4e5f6789abcdef2"]
 *     responses:
 *       '200':
 *         description: Thanh toán được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/PaymentResponse'
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Appointment payment created successfully"
 *             examples:
 *               payos_success:
 *                 summary: Thành công tạo thanh toán PayOS
 *                 value:
 *                   data:
 *                     id: "64a1b2c3d4e5f6789abcdef0"
 *                     payment_no: "PAY_123456789"
 *                     amount: 500000
 *                     status: "pending"
 *                     payment_method: "pay_os"
 *                     appointment_id: "64a1b2c3d4e5f6789abcdef0"
 *                     payos_checkout_url: "https://pay.payos.vn/web/payment/123456"
 *                     created_at: "2024-01-01T10:00:00.000Z"
 *                   success: true
 *                   message: "Appointment payment created successfully"
 *               cash_success:
 *                 summary: Thành công tạo thanh toán tiền mặt
 *                 value:
 *                   data:
 *                     id: "64a1b2c3d4e5f6789abcdef0"
 *                     payment_no: "PAY_123456789"
 *                     amount: 500000
 *                     status: "pending"
 *                     payment_method: "cash"
 *                     appointment_id: "64a1b2c3d4e5f6789abcdef0"
 *                     created_at: "2024-01-01T10:00:00.000Z"
 *                   success: true
 *                   message: "Appointment payment created successfully"
 *       '401':
 *         description: Chưa xác thực người dùng hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '400':
 *         description: Dữ liệu đầu vào không hợp lệ (thiếu trường bắt buộc, sai định dạng)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Không tìm thấy lịch hẹn hoặc mẫu xét nghiệm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Không có quyền truy cập lịch hẹn này
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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