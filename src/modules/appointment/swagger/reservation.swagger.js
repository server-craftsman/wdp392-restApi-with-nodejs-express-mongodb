/**
 * @swagger
 * tags:
 *   name: reservations
 *   description: Quản lý đặt giữ chỗ cho dịch vụ hành chính - Administrative Service Reservations
 */

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags: [reservations]
 *     summary: Tạo đặt giữ chỗ cho dịch vụ hành chính
 *     description: |
 *       Tạo đặt giữ chỗ cho dịch vụ xét nghiệm DNA pháp lý.
 *       Đây là bước đầu tiên khi customer có nhu cầu xét nghiệm DNA pháp lý.
 *       
 *       **Quy trình:**
 *       1. Customer xác định nhu cầu xét nghiệm (paternity, maternity, sibling, etc.)
 *       2. Chọn dịch vụ hành chính phù hợp
 *       3. Tạo đặt giữ chỗ với thông tin cần thiết
 *       4. Đặt giữ chỗ có hiệu lực trong 24 giờ
 *       5. Customer thanh toán đặt cọc hoặc toàn bộ
 *       6. Staff xác nhận đặt giữ chỗ
 *       7. Customer chuyển đổi thành appointment
 *       
 *       **Loại nhu cầu xét nghiệm:**
 *       - paternity: Xác định cha con
 *       - maternity: Xác định mẹ con
 *       - sibling: Xác định anh chị em
 *       - kinship: Xác định họ hàng
 *       - immigration: Nhập cư
 *       - inheritance: Thừa kế
 *       - other: Khác
 *       
 *       **Tự động điền từ dịch vụ:**
 *       - total_amount: Sẽ được lấy từ service.price nếu không cung cấp
 *       - deposit_amount: Sẽ được tính 20% của total_amount nếu không cung cấp
 *       - collection_type: Sẽ được đặt mặc định là "facility" nếu không cung cấp
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReservationRequest'
 *           example:
 *             service_id: "60d21b4667d0d8992e610c86"
 *             testing_need: "paternity"
 *             preferred_appointment_date: "2024-02-15T09:00:00.000Z"
 *             preferred_time_slots: ["09:00", "10:00", "14:00"]
 *             collection_address: "123 Nguyễn Huệ, Q1, TP.HCM"
 *             contact_phone: 0123456789
 *             contact_email: "customer@email.com"
 *             special_requirements: "Cần hỗ trợ đặc biệt cho người khuyết tật"
 *             notes: ["Ghi chú về yêu cầu đặc biệt"]
 *     responses:
 *       201:
 *         description: |
 *           Tạo đặt giữ chỗ thành công.
 *           Nếu total_amount, deposit_amount, hoặc collection_type không được cung cấp, 
 *           chúng sẽ được tự động điền từ thông tin dịch vụ.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResponse'
 *       400:
 *         description: |
 *           Lỗi validation hoặc dịch vụ không khả dụng:
 *           - Service is not available
 *           - Only administrative services can be reserved through this endpoint
 *           - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chưa đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy dịch vụ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     tags: [reservations]
 *     summary: Lấy danh sách đặt giữ chỗ của user
 *     description: Lấy tất cả đặt giữ chỗ của user hiện tại
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Danh sách đặt giữ chỗ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 message:
 *                   type: string
 *                   example: "User reservations retrieved successfully"
 */

/**
 * @swagger
 * /api/reservations/service/{serviceId}:
 *   get:
 *     tags: [reservations]
 *     summary: Lấy đặt giữ chỗ theo dịch vụ (Admin/Manager/Staff)
 *     description: Lấy tất cả đặt giữ chỗ của một dịch vụ cụ thể
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của dịch vụ
 *         example: "60d21b4667d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Danh sách đặt giữ chỗ của dịch vụ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 message:
 *                   type: string
 *                   example: "Service reservations retrieved successfully"
 *       403:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/reservations/testing-need/{testingNeed}:
 *   get:
 *     tags: [reservations]
 *     summary: Lấy đặt giữ chỗ theo nhu cầu xét nghiệm (Admin/Manager/Staff)
 *     description: Lấy tất cả đặt giữ chỗ theo loại nhu cầu xét nghiệm cụ thể
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: testingNeed
 *         required: true
 *         schema:
 *           type: string
 *           enum: [paternity, maternity, sibling, kinship, immigration, inheritance, other]
 *         description: Loại nhu cầu xét nghiệm
 *         example: "paternity"
 *     responses:
 *       200:
 *         description: Danh sách đặt giữ chỗ theo nhu cầu xét nghiệm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 message:
 *                   type: string
 *                   example: "Testing need reservations retrieved successfully"
 *       403:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     tags: [reservations]
 *     summary: Lấy chi tiết đặt giữ chỗ theo ID
 *     description: Lấy thông tin chi tiết của một đặt giữ chỗ cụ thể
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đặt giữ chỗ
 *         example: "60d21b4667d0d8992e610c87"
 *     responses:
 *       200:
 *         description: Thông tin đặt giữ chỗ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResponse'
 *       404:
 *         description: Không tìm thấy đặt giữ chỗ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [reservations]
 *     summary: Cập nhật đặt giữ chỗ
 *     description: Cập nhật thông tin đặt giữ chỗ (chỉ owner hoặc Admin/Manager)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đặt giữ chỗ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReservationRequest'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResponse'
 *   delete:
 *     tags: [reservations]
 *     summary: Hủy đặt giữ chỗ
 *     description: Hủy đặt giữ chỗ (chỉ owner hoặc Admin/Manager)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đặt giữ chỗ
 *     responses:
 *       200:
 *         description: Hủy thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResponse'
 */

/**
 * @swagger
 * /api/reservations/{id}/payment:
 *   post:
 *     tags: [reservations]
 *     summary: Thanh toán cho đặt giữ chỗ
 *     description: |
 *       Xử lý thanh toán cho đặt giữ chỗ.
 *       
 *       **Loại thanh toán:**
 *       - deposit: Đặt cọc
 *       - full_payment: Thanh toán toàn bộ
 *       - partial_payment: Thanh toán một phần
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đặt giữ chỗ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationPaymentRequest'
 *           example:
 *             reservation_id: "60d21b4667d0d8992e610c87"
 *             payment_type: "deposit"
 *             amount: 1000000
 *             payment_method: "payos"
 *             payment_reference: "PAY-REF-001"
 *     responses:
 *       200:
 *         description: Thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *                     reservation:
 *                       $ref: '#/components/schemas/Reservation'
 *                 message:
 *                   type: string
 *                   example: "Payment processed successfully"
 */

/**
 * @swagger
 * /api/reservations/{id}/convert:
 *   post:
 *     tags: [reservations]
 *     summary: Chuyển đổi đặt giữ chỗ thành appointment
 *     description: |
 *       Chuyển đổi đặt giữ chỗ đã được xác nhận và thanh toán đủ thành appointment.
 *       
 *       **Điều kiện:**
 *       - Đặt giữ chỗ phải được xác nhận (confirmed)
 *       - Đã thanh toán đủ (paid)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đặt giữ chỗ
 *     responses:
 *       200:
 *         description: Chuyển đổi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       $ref: '#/components/schemas/Appointment'
 *                     reservation:
 *                       $ref: '#/components/schemas/Reservation'
 *                 message:
 *                   type: string
 *                   example: "Reservation converted to appointment successfully"
 */

/**
 * @swagger
 * /api/reservations/{id}/confirm:
 *   put:
 *     tags: [reservations]
 *     summary: Xác nhận đặt giữ chỗ (Admin/Manager/Staff)
 *     description: Xác nhận đặt giữ chỗ của customer (chỉ Admin/Manager/Staff)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đặt giữ chỗ
 *     responses:
 *       200:
 *         description: Xác nhận thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResponse'
 *       403:
 *         description: Không có quyền xác nhận
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateReservationRequest:
 *       type: object
 *       required:
 *         - service_id
 *         - testing_need
 *         - contact_phone
 *         - contact_email
 *       properties:
 *         service_id:
 *           type: string
 *           description: ID của dịch vụ hành chính
 *           example: "60d21b4667d0d8992e610c86"
 *         testing_need:
 *           type: string
 *           enum: [paternity, maternity, sibling, kinship, immigration, inheritance, other]
 *           description: Loại nhu cầu xét nghiệm
 *           example: "paternity"
 *         total_amount:
 *           type: number
 *           minimum: 0
 *           description: Tổng số tiền (tự động lấy từ service.price nếu không cung cấp)
 *           example: 5000000
 *         deposit_amount:
 *           type: number
 *           minimum: 0
 *           description: Số tiền đặt cọc (tự động tính 20% của total_amount nếu không cung cấp)
 *           example: 1000000
 *         preferred_appointment_date:
 *           type: string
 *           format: date-time
 *           description: Ngày hẹn mong muốn
 *           example: "2024-02-15T09:00:00.000Z"
 *         preferred_time_slots:
 *           type: array
 *           items:
 *             type: string
 *           description: Các khung giờ mong muốn
 *           example: ["09:00", "10:00", "14:00"]
 *         collection_type:
 *           type: string
 *           enum: [self, facility, home, administrative]
 *           description: Loại lấy mẫu (tự động đặt là "facility" nếu không cung cấp)
 *           example: "facility"
 *         collection_address:
 *           type: string
 *           maxLength: 500
 *           description: Địa chỉ lấy mẫu
 *           example: "123 Nguyễn Huệ, Q1, TP.HCM"
 *         contact_phone:
 *           type: string
 *           maxLength: 20
 *           description: Số điện thoại liên hệ
 *           example: "0123456789"
 *         contact_email:
 *           type: string
 *           format: email
 *           description: Email liên hệ
 *           example: "customer@email.com"
 *         special_requirements:
 *           type: string
 *           maxLength: 1000
 *           description: Yêu cầu đặc biệt
 *           example: "Cần hỗ trợ đặc biệt cho người khuyết tật"
 *         notes:
 *           type: array
 *           items:
 *             type: string
 *           description: Ghi chú
 *           example: ["Ghi chú về yêu cầu đặc biệt"]
 *
 *     UpdateReservationRequest:
 *       type: object
 *       properties:
 *         preferred_appointment_date:
 *           type: string
 *           format: date-time
 *           description: Ngày hẹn mong muốn
 *         preferred_time_slots:
 *           type: array
 *           items:
 *             type: string
 *           description: Các khung giờ mong muốn
 *         collection_type:
 *           type: string
 *           enum: [self, facility, home, administrative]
 *           description: Loại lấy mẫu
 *         collection_address:
 *           type: string
 *           maxLength: 500
 *           description: Địa chỉ lấy mẫu
 *         contact_phone:
 *           type: string
 *           maxLength: 20
 *           description: Số điện thoại liên hệ
 *         contact_email:
 *           type: string
 *           format: email
 *           description: Email liên hệ
 *         special_requirements:
 *           type: string
 *           maxLength: 1000
 *           description: Yêu cầu đặc biệt
 *         notes:
 *           type: array
 *           items:
 *             type: string
 *           description: Ghi chú
 *
 *     ReservationPaymentRequest:
 *       type: object
 *       required:
 *         - reservation_id
 *         - payment_type
 *         - amount
 *         - payment_method
 *       properties:
 *         reservation_id:
 *           type: string
 *           description: ID của đặt giữ chỗ
 *           example: "60d21b4667d0d8992e610c87"
 *         payment_type:
 *           type: string
 *           enum: [deposit, full_payment, partial_payment]
 *           description: Loại thanh toán
 *           example: "deposit"
 *         amount:
 *           type: number
 *           minimum: 0
 *           description: Số tiền thanh toán
 *           example: 1000000
 *         payment_method:
 *           type: string
 *           description: Phương thức thanh toán
 *           example: "payos"
 *         payment_reference:
 *           type: string
 *           description: Mã tham chiếu thanh toán
 *           example: "PAY-REF-001"
 *
 *     ReservationPaymentHistory:
 *       type: object
 *       properties:
 *         payment_id:
 *           type: string
 *           description: ID của payment
 *           example: "60d21b4667d0d8992e610c88"
 *         amount:
 *           type: number
 *           description: Số tiền
 *           example: 1000000
 *         payment_date:
 *           type: string
 *           format: date-time
 *           description: Ngày thanh toán
 *           example: "2024-01-15T10:30:00.000Z"
 *         payment_method:
 *           type: string
 *           description: Phương thức thanh toán
 *           example: "payos"
 *         status:
 *           type: string
 *           description: Trạng thái thanh toán
 *           example: "completed"
 *
 *     Reservation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của đặt giữ chỗ
 *           example: "60d21b4667d0d8992e610c87"
 *         user_id:
 *           type: string
 *           description: ID của user
 *           example: "60d21b4667d0d8992e610c89"
 *         service_id:
 *           type: string
 *           description: ID của dịch vụ
 *           example: "60d21b4667d0d8992e610c86"
 *         reservation_type:
 *           type: string
 *           enum: [administrative_service, civil_service, regular_service]
 *           description: Loại đặt giữ chỗ
 *           example: "administrative_service"
 *         testing_need:
 *           type: string
 *           enum: [paternity, maternity, sibling, kinship, immigration, inheritance, other]
 *           description: Loại nhu cầu xét nghiệm
 *           example: "paternity"
 *         status:
 *           type: string
 *           enum: [pending, confirmed, expired, cancelled, converted]
 *           description: Trạng thái đặt giữ chỗ
 *           example: "pending"
 *         payment_status:
 *           type: string
 *           enum: [unpaid, paid, refunded, failed, government_funded]
 *           description: Trạng thái thanh toán
 *           example: "unpaid"
 *         payment_type:
 *           type: string
 *           enum: [deposit, full_payment, partial_payment]
 *           description: Loại thanh toán
 *           example: "deposit"
 *         total_amount:
 *           type: number
 *           description: Tổng số tiền
 *           example: 5000000
 *         deposit_amount:
 *           type: number
 *           description: Số tiền đặt cọc
 *           example: 1000000
 *         amount_paid:
 *           type: number
 *           description: Số tiền đã thanh toán
 *           example: 0
 *         remaining_amount:
 *           type: number
 *           description: Số tiền còn lại
 *           example: 5000000
 *         preferred_appointment_date:
 *           type: string
 *           format: date-time
 *           description: Ngày hẹn mong muốn
 *           example: "2024-02-15T09:00:00.000Z"
 *         preferred_time_slots:
 *           type: array
 *           items:
 *             type: string
 *           description: Các khung giờ mong muốn
 *           example: ["09:00", "10:00", "14:00"]
 *         collection_type:
 *           type: string
 *           enum: [self, facility, home, administrative]
 *           description: Loại lấy mẫu
 *           example: "facility"
 *         collection_address:
 *           type: string
 *           description: Địa chỉ lấy mẫu
 *           example: "123 Nguyễn Huệ, Q1, TP.HCM"
 *         contact_phone:
 *           type: string
 *           description: Số điện thoại liên hệ
 *           example: "0123456789"
 *         contact_email:
 *           type: string
 *           description: Email liên hệ
 *           example: "customer@email.com"
 *         special_requirements:
 *           type: string
 *           description: Yêu cầu đặc biệt
 *           example: "Cần hỗ trợ đặc biệt cho người khuyết tật"
 *         notes:
 *           type: array
 *           items:
 *             type: string
 *           description: Ghi chú
 *           example: ["Ghi chú về yêu cầu đặc biệt"]
 *         reservation_expires_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian hết hạn đặt giữ chỗ
 *           example: "2024-01-16T10:30:00.000Z"
 *         converted_to_appointment_id:
 *           type: string
 *           description: ID của appointment được chuyển đổi
 *           example: "60d21b4667d0d8992e610c90"
 *         payment_history:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReservationPaymentHistory'
 *           description: Lịch sử thanh toán
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *           example: "2024-01-15T10:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật cuối
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     ReservationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Reservation'
 *         message:
 *           type: string
 *           example: "Reservation created successfully"
 */ 