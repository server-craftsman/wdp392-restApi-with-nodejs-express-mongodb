/**
 * @swagger
 * components:
 *   schemas:
 *     ResultData:
 *       type: object
 *       properties:
 *         probability:
 *           type: number
 *           description: Xác suất khớp (phần trăm)
 *           example: 99.99
 *         confidence_interval:
 *           type: string
 *           description: Khoảng tin cậy cho kết quả
 *           example: "99.9% - 100%"
 *         markers_tested:
 *           type: number
 *           description: Số lượng marker được xét nghiệm
 *           example: 24
 *         markers_matched:
 *           type: number
 *           description: Số lượng marker khớp
 *           example: 24
 *         dna_match_percentage:
 *           type: number
 *           description: Phần trăm khớp ADN
 *           example: 99.99
 *         confidence_level:
 *           type: string
 *           description: Mức độ tin cậy
 *           example: "high"
 *
 *     ResultResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Result'
 *         message:
 *           type: string
 *           example: "Thao tác thành công"
 *
 *     ResultArrayResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Result'
 *         message:
 *           type: string
 *           example: "Lấy danh sách kết quả thành công"
 *
 *     CertificateRequestResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/CertificateRequest'
 *         message:
 *           type: string
 *           example: "Thao tác thành công"
 *
 *     CertificateRequestArrayResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CertificateRequest'
 *         message:
 *           type: string
 *           example: "Lấy danh sách yêu cầu giấy chứng nhận thành công"
 *
 *     StartTestingResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Quy trình xét nghiệm đã bắt đầu cho 2 mẫu, 0 thất bại"
 *             results:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID mẫu
 *                     example: "60c72b2f9b1e8b3b4c8d6e26"
 *                   success:
 *                     type: boolean
 *                     description: Xét nghiệm có bắt đầu thành công cho mẫu này không
 *                     example: true
 *                   error:
 *                     type: string
 *                     description: Thông báo lỗi nếu xét nghiệm thất bại cho mẫu này
 *                     example: "Không tìm thấy mẫu"
 *         message:
 *           type: string
 *           example: "Quy trình xét nghiệm đã bắt đầu thành công"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Thông báo lỗi"
 *         error:
 *           type: string
 *           example: "Chi tiết lỗi"
 *         stack:
 *           type: string
 *           example: "Stack trace (chỉ trong môi trường development)"
 *
 *     CertificateRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của yêu cầu giấy chứng nhận
 *           example: "60d21b4667d0d8992e610c85"
 *         result_id:
 *           type: string
 *           description: ID kết quả xét nghiệm
 *           example: "60d21b4667d0d8992e610c84"
 *         customer_id:
 *           type: string
 *           description: ID khách hàng
 *           example: "60d21b4667d0d8992e610c83"
 *         request_count:
 *           type: number
 *           description: Số lần yêu cầu (1 = miễn phí, 2+ = có phí)
 *           example: 1
 *         reason:
 *           type: string
 *           description: Lý do yêu cầu
 *           example: "Cần giấy chứng nhận cho thủ tục pháp lý"
 *         payment_id:
 *           type: string
 *           description: ID thanh toán (nếu có phí)
 *           example: "60d21b4667d0d8992e610c86"
 *         is_paid:
 *           type: boolean
 *           description: Đã thanh toán chưa
 *           example: true
 *         certificate_issued_at:
 *           type: string
 *           format: date-time
 *           description: Ngày phát giấy chứng nhận
 *           example: "2024-01-20T10:30:00.000Z"
 *         status:
 *           type: string
 *           enum: [pending, processing, issued, rejected]
 *           description: Trạng thái yêu cầu
 *           example: "processing"
 *         agency_notes:
 *           type: string
 *           description: Ghi chú từ cơ quan
 *           example: "Yêu cầu đã được xử lý"
 *         delivery_address:
 *           type: string
 *           description: Địa chỉ giao hàng
 *           example: "123 Nguyễn Văn Cừ, Quận 1, TP.HCM"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo yêu cầu
 *           example: "2024-01-15T09:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Ngày cập nhật cuối
 *           example: "2024-01-16T14:30:00.000Z"
 *
 *     CreateCertificateRequest:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           description: Lý do yêu cầu giấy chứng nhận
 *           example: "Cần giấy chứng nhận bản cứng cho thủ tục pháp lý"
 *         delivery_address:
 *           type: string
 *           description: Địa chỉ giao hàng (tùy chọn)
 *           example: "123 Nguyễn Văn Cừ, Quận 1, TP.HCM"
 *
 *     UpdateCertificateRequestStatus:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, processing, issued, rejected]
 *           description: Trạng thái mới
 *           example: "issued"
 *         agency_notes:
 *           type: string
 *           description: Ghi chú từ cơ quan
 *           example: "Giấy chứng nhận đã được cấp thành công"
 *     
 *     CreateResult:
 *       type: object
 *       required:
 *         - sample_ids
 *         - appointment_id
 *         - is_match
 *       properties:
 *         sample_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID mẫu xét nghiệm
 *           example: ["60c72b2f9b1e8b3b4c8d6e26", "60c72b2f9b1e8b3b4c8d6e27"]
 *         appointment_id:
 *           type: string
 *           description: ID lịch hẹn
 *           example: 5f8d0e0e9d3b9a0017c1a7a2
 *         is_match:
 *           type: boolean
 *           description: Kết quả có khớp hay không
 *           example: true
 *         result_data:
 *           $ref: '#/components/schemas/ResultData'
 *       description: |
 *         Tạo kết quả xét nghiệm mới. 
 *         Báo cáo PDF sẽ được tự động tạo và trường report_url sẽ được điền.
 *         PDF sẽ bao gồm thông tin khách hàng, chi tiết mẫu và kết quả xét nghiệm.
 * 
 *     UpdateResult:
 *       type: object
 *       properties:
 *         is_match:
 *           type: boolean
 *           description: Kết quả có khớp hay không
 *           example: true
 *         result_data:
 *           $ref: '#/components/schemas/ResultData'
 *       description: |
 *         Cập nhật kết quả xét nghiệm. 
 *         Nếu is_match hoặc result_data thay đổi, báo cáo PDF mới sẽ được tự động tạo.
 * 
 *     Result:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID kết quả
 *         sample_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID mẫu
 *           example: ["60c72b2f9b1e8b3b4c8d6e26", "60c72b2f9b1e8b3b4c8d6e27"]
 *         appointment_id:
 *           type: string
 *           description: ID lịch hẹn
 *         customer_id:
 *           type: string
 *           description: ID khách hàng
 *         laboratory_technician_id:
 *           type: string
 *           description: ID kỹ thuật viên phòng xét nghiệm thực hiện xét nghiệm
 *         is_match:
 *           type: boolean
 *           description: Kết quả có khớp hay không
 *         result_data:
 *           $ref: '#/components/schemas/ResultData'
 *         report_url:
 *           type: string
 *           description: URL đến báo cáo PDF của kết quả xét nghiệm
 *           example: https://medical-test-results.s3.us-east-1.amazonaws.com/test-results/5f8d0e0e9d3b9a0017c1a7a3/5f8d0e0e9d3b9a0017c1a7a4-20231025.pdf
 *         completed_at:
 *           type: string
 *           format: date-time
 *           description: Khi nào xét nghiệm được hoàn thành
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Khi nào kết quả được tạo
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Lần cuối kết quả được cập nhật
 * 
 *     StartTesting:
 *       type: object
 *       required:
 *         - testing_start_date
 *       properties:
 *         testing_start_date:
 *           type: string
 *           format: date-time
 *           description: Ngày bắt đầu quy trình xét nghiệm
 *           example: "2024-01-25T10:00:00.000Z"
 *         notes:
 *           type: string
 *           description: Ghi chú về quy trình xét nghiệm
 *           example: "Bắt đầu quy trình xét nghiệm ADN"
 *         sample_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Mảng ID mẫu để bắt đầu xét nghiệm (cho xử lý hàng loạt)
 *           example: ["60c72b2f9b1e8b3b4c8d6e26", "60c72b2f9b1e8b3b4c8d6e27"]
 */

/**
 * @swagger
 * /api/result:
 *   post:
 *     summary: Tạo kết quả xét nghiệm mới (Kỹ thuật viên)
 *     description: |
 *       Tạo kết quả xét nghiệm mới với tự động tạo báo cáo PDF.
 *       Báo cáo sẽ bao gồm thông tin chi tiết về xét nghiệm và kết quả.
 *       Chỉ kỹ thuật viên phòng xét nghiệm mới có thể tạo kết quả.
 *       
 *       **Quy trình:**
 *       1. Xác thực mẫu xét nghiệm và lịch hẹn
 *       2. Tạo kết quả xét nghiệm
 *       3. Tự động tạo báo cáo PDF
 *       4. Cập nhật trạng thái mẫu và lịch hẹn
 *       5. Gửi email thông báo có kết quả
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResult'
 *           example:
 *             sample_ids: ["60c72b2f9b1e8b3b4c8d6e26", "60c72b2f9b1e8b3b4c8d6e27"]
 *             appointment_id: "5f8d0e0e9d3b9a0017c1a7a2"
 *             is_match: true
 *             result_data:
 *               probability: 99.99
 *               confidence_interval: "99.9% - 100%"
 *               markers_tested: 24
 *               markers_matched: 24
 *               dna_match_percentage: 99.99
 *               confidence_level: "high"
 *     responses:
 *       201:
 *         description: Kết quả được tạo thành công, bắt đầu tạo PDF
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultResponse'
 *       400:
 *         description: |
 *           Lỗi dữ liệu yêu cầu:
 *           - Thiếu sample_ids hoặc appointment_id
 *           - Mẫu không ở trạng thái TESTING
 *           - Lịch hẹn chưa thanh toán
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
 *       403:
 *         description: Chỉ kỹ thuật viên phòng xét nghiệm mới có thể tạo kết quả
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy mẫu hoặc lịch hẹn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Kết quả đã tồn tại cho mẫu này
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 * /api/result/{id}:
 *   get:
 *     summary: Lấy kết quả theo ID (Tất cả người dùng đã xác thực)
 *     description: |
 *       Lấy kết quả xét nghiệm theo ID. Bao gồm URL báo cáo PDF.
 *       
 *       **Phân quyền:**
 *       - **Khách hàng:** Chỉ xem được kết quả của chính mình
 *       - **Nhân viên/Kỹ thuật viên/Quản lý/Admin:** Xem được tất cả kết quả
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kết quả xét nghiệm
 *         example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Lấy kết quả thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xem kết quả này
 *       404:
 *         description: Không tìm thấy kết quả
 * 
 *   put:
 *     summary: Cập nhật kết quả xét nghiệm (Kỹ thuật viên)
 *     description: |
 *       Cập nhật kết quả xét nghiệm. Nếu thay đổi is_match hoặc result_data,
 *       báo cáo PDF mới sẽ được tự động tạo.
 *       
 *       **Tự động:**
 *       - Tạo lại báo cáo PDF nếu có thay đổi quan trọng
 *       - Gửi email thông báo cập nhật cho khách hàng
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kết quả xét nghiệm
 *         example: "60d21b4667d0d8992e610c85"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResult'
 *           example:
 *             is_match: true
 *             result_data:
 *               probability: 99.99
 *               confidence_interval: "99.9% - 100%"
 *               markers_tested: 24
 *               markers_matched: 24
 *     responses:
 *       200:
 *         description: Kết quả được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultResponse'
 *       401:
 *         description: Chưa đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Chỉ kỹ thuật viên phòng xét nghiệm mới có thể cập nhật kết quả
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy kết quả
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/result/sample/{sampleId}:
 *   get:
 *     summary: Lấy kết quả theo ID mẫu xét nghiệm (Tất cả người dùng đã xác thực)
 *     description: |
 *       Lấy kết quả xét nghiệm theo ID mẫu liên quan. Tìm kiếm ID mẫu trong mảng sample_ids. 
 *       Bao gồm URL báo cáo PDF.
 *       
 *       **Phân quyền:**
 *       - **Khách hàng:** Chỉ xem được kết quả của chính mình
 *       - **Nhân viên/Kỹ thuật viên/Quản lý/Admin:** Xem được tất cả kết quả
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: sampleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID mẫu xét nghiệm
 *         example: "60c72b2f9b1e8b3b4c8d6e26"
 *     responses:
 *       200:
 *         description: Lấy kết quả thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xem kết quả này
 *       404:
 *         description: Không tìm thấy kết quả cho mẫu này
 *
 * /api/result/appointment/{appointmentId}:
 *   get:
 *     summary: Lấy kết quả theo ID lịch hẹn (Tất cả người dùng đã xác thực)
 *     description: |
 *       Lấy kết quả xét nghiệm theo ID lịch hẹn liên quan. Bao gồm URL báo cáo PDF.
 *       
 *       **Phân quyền:**
 *       - **Khách hàng:** Chỉ xem được kết quả của chính mình
 *       - **Nhân viên/Kỹ thuật viên/Quản lý/Admin:** Xem được tất cả kết quả
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lịch hẹn
 *         example: "5f8d0e0e9d3b9a0017c1a7a2"
 *     responses:
 *       200:
 *         description: Lấy kết quả thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xem kết quả này
 *       404:
 *         description: Không tìm thấy kết quả cho lịch hẹn này
 * 
 * /api/result/sample/start-testing:
 *   post:
 *     summary: Bắt đầu quy trình xét nghiệm cho nhiều mẫu (xử lý hàng loạt) (Kỹ thuật viên)
 *     description: |
 *       Đánh dấu nhiều mẫu đang được xét nghiệm trong một yêu cầu duy nhất.
 *       Cập nhật trạng thái mỗi mẫu thành TESTING và trạng thái lịch hẹn liên quan thành TESTING.
 *       Chỉ kỹ thuật viên phòng xét nghiệm mới có thể bắt đầu xét nghiệm.
 *       
 *       **Quy trình:**
 *       1. Xác thực tất cả mẫu và lịch hẹn
 *       2. Kiểm tra trạng thái thanh toán
 *       3. Cập nhật trạng thái mẫu từ PENDING/RECEIVED → TESTING
 *       4. Cập nhật trạng thái lịch hẹn → TESTING
 *       5. Gửi email thông báo bắt đầu xét nghiệm
 *       6. Ghi log hoạt động
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartTesting'
 *           example:
 *             testing_start_date: "2024-01-25T10:00:00.000Z"
 *             notes: "Bắt đầu quy trình xét nghiệm ADN"
 *             sample_ids: ["60c72b2f9b1e8b3b4c8d6e26", "60c72b2f9b1e8b3b4c8d6e27"]
 *     responses:
 *       200:
 *         description: Quy trình xét nghiệm đã bắt đầu cho nhiều mẫu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StartTestingResponse'
 *       400:
 *         description: |
 *           Yêu cầu không hợp lệ:
 *           - Không cung cấp ID mẫu
 *           - Mẫu đã đang trong quá trình xét nghiệm
 *           - Lịch hẹn chưa thanh toán
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
 *       403:
 *         description: Chỉ kỹ thuật viên phòng xét nghiệm mới có thể bắt đầu xét nghiệm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Một hoặc nhiều mẫu không tìm thấy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi máy chủ nội bộ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/result/{resultId}/request-certificate:
 *   post:
 *     tags: [results]
 *     summary: Yêu cầu giấy chứng nhận bản cứng (Khách hàng)
 *     description: |
 *       Khách hàng yêu cầu cấp giấy chứng nhận bản cứng cho kết quả xét nghiệm ADN pháp lý.
 *       
 *       **Chính sách phí:**
 *       - Lần đầu tiên: **Miễn phí**
 *       - Từ lần thứ 2 trở đi: **50.000 VNĐ/bản**
 *       
 *       **Điều kiện:**
 *       - Chỉ áp dụng cho kết quả xét nghiệm hành chính/pháp lý
 *       - Khách hàng phải là chủ sở hữu của kết quả
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kết quả xét nghiệm
 *         example: "60d21b4667d0d8992e610c84"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCertificateRequest'
 *           example:
 *             reason: "Cần giấy chứng nhận bản cứng cho thủ tục pháp lý tại tòa án"
 *             delivery_address: "123 Nguyễn Văn Cừ, Quận 1, TP.HCM"
 *     responses:
 *       201:
 *         description: Yêu cầu giấy chứng nhận được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateRequestResponse'
 *       400:
 *         description: |
 *           Lỗi yêu cầu:
 *           - Thiếu thông tin bắt buộc
 *           - Kết quả không phải từ xét nghiệm hành chính/pháp lý
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
 *       403:
 *         description: Không có quyền yêu cầu giấy chứng nhận cho kết quả này
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy kết quả xét nghiệm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/result/{resultId}/certificate-requests:
 *   get:
 *     tags: [results]
 *     summary: Lấy danh sách yêu cầu giấy chứng nhận
 *     description: |
 *       Lấy tất cả yêu cầu giấy chứng nhận cho một kết quả xét nghiệm cụ thể.
 *       
 *       **Phân quyền:**
 *       - **Khách hàng:** Chỉ xem được yêu cầu của chính mình
 *       - **Nhân viên/Quản lý:** Xem được tất cả yêu cầu
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kết quả xét nghiệm
 *         example: "60d21b4667d0d8992e610c84"
 *     responses:
 *       200:
 *         description: Danh sách yêu cầu giấy chứng nhận
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateRequestArrayResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xem yêu cầu giấy chứng nhận cho kết quả này
 *       404:
 *         description: Không tìm thấy kết quả xét nghiệm
 *       500:
 *         description: Lỗi hệ thống
 *
 * /api/result/certificate-requests/{requestId}/status:
 *   put:
 *     tags: [results]
 *     summary: Cập nhật trạng thái yêu cầu giấy chứng nhận (Nhân viên/Quản lý)
 *     description: |
 *       Cập nhật trạng thái xử lý yêu cầu giấy chứng nhận.
 *       
 *       **Quy trình:**
 *       1. `pending` → `processing`: Bắt đầu xử lý
 *       2. `processing` → `issued`: Đã cấp giấy chứng nhận
 *       3. `processing` → `rejected`: Từ chối yêu cầu
 *       
 *       **Lưu ý:** 
 *       - Khi chuyển sang `issued`, hệ thống tự động ghi nhận thời gian cấp giấy
 *       - Email thông báo sẽ được gửi tự động cho khách hàng
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID yêu cầu giấy chứng nhận
 *         example: "60d21b4667d0d8992e610c85"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCertificateRequestStatus'
 *           example:
 *             status: "issued"
 *             agency_notes: "Giấy chứng nhận đã được cấp thành công. Vui lòng mang theo CMND để nhận."
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateRequestResponse'
 *       400:
 *         description: |
 *           Lỗi yêu cầu:
 *           - Trạng thái không hợp lệ
 *           - Thiếu thông tin bắt buộc
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
 *       403:
 *         description: Chỉ nhân viên và quản lý mới có quyền cập nhật trạng thái
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy yêu cầu giấy chứng nhận
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */

/**
 * @swagger
 * /api/result/test-pdf:
 *   get:
 *     tags: [results]
 *     summary: Test PDF generation with sample data (Development/Testing only)
 *     description: |
 *       Generate a test PDF report with sample data to verify PDF generation functionality and Vietnamese character encoding. 
 *       This endpoint is for development and testing purposes only.
 *       
 *       **Important Notes:**
 *       - **NO database operations** - Data is NOT saved to MongoDB
 *       - **Unique IDs** - Uses timestamp + random string to avoid MongoDB conflicts
 *       - **Test data only** - All data is generated for testing purposes
 *       - **PDF generation only** - Only creates and uploads PDF file
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: PDF generated successfully for testing (NOT saved to database)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "PDF generated successfully for testing (NOT saved to database)"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pdfUrl:
 *                       type: string
 *                       description: URL to the generated PDF file
 *                       example: "https://wdp392-generate-pdf.s3.ap-southeast-2.amazonaws.com/test-results/TEST-1703123456789-abc123/TEST-1703123456789-abc123-20241226-123456.pdf"
 *                     testInfo:
 *                       type: object
 *                       description: Test information summary
 *                       properties:
 *                         resultId:
 *                           type: string
 *                           description: Unique test result ID (timestamp + random string)
 *                           example: "TEST-1703123456789-abc123"
 *                         isMatch:
 *                           type: boolean
 *                           example: true
 *                         customerName:
 *                           type: string
 *                           example: "Nhân viên Hành chính NVHC"
 *                         caseNumber:
 *                           type: string
 *                           example: "PL-TEST-1703123456789"
 *                         generatedAt:
 *                           type: string
 *                           format: date-time
 *                           description: When the test PDF was generated
 *                           example: "2024-12-26T12:34:56.789Z"
 *                         note:
 *                           type: string
 *                           example: "This is test data only - no database operations performed"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Access denied (Staff, Manager, or Admin access required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error - PDF generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/result/simple-test-pdf:
 *   get:
 *     tags: [results]
 *     summary: Simple test PDF generation (Development/Testing only)
 *     description: |
 *       Generate a simple test PDF report with basic sample data to verify PDF generation functionality and Vietnamese character encoding. 
 *       This endpoint is for development and testing purposes only.
 *       
 *       **Important Notes:**
 *       - **NO database operations** - Data is NOT saved to MongoDB
 *       - **Unique IDs** - Uses timestamp + random string to avoid MongoDB conflicts
 *       - **Test data only** - All data is generated for testing purposes
 *       - **PDF generation only** - Only creates and uploads PDF file
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Simple test PDF generated successfully (NOT saved to database)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Simple test PDF generated successfully (NOT saved to database)"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pdfUrl:
 *                       type: string
 *                       description: URL to the generated PDF file
 *                       example: "https://wdp392-generate-pdf.s3.ap-southeast-2.amazonaws.com/test-results/SIMPLE-TEST-1703123456789-xyz789/SIMPLE-TEST-1703123456789-xyz789-20241226-123456.pdf"
 *                     testInfo:
 *                       type: object
 *                       description: Test information summary
 *                       properties:
 *                         resultId:
 *                           type: string
 *                           description: Unique test result ID (timestamp + random string)
 *                           example: "SIMPLE-TEST-1703123456789-xyz789"
 *                         isMatch:
 *                           type: boolean
 *                           example: true
 *                         customerName:
 *                           type: string
 *                           example: "Khách hàng Test"
 *                         caseNumber:
 *                           type: string
 *                           example: "CASE-SIMPLE-1703123456789"
 *                         generatedAt:
 *                           type: string
 *                           format: date-time
 *                           description: When the test PDF was generated
 *                           example: "2024-12-26T12:34:56.789Z"
 *                         note:
 *                           type: string
 *                           example: "This is test data only - no database operations performed"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Access denied (Staff, Manager, or Admin access required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error - PDF generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/result/test-ids:
 *   get:
 *     tags: [results]
 *     summary: Get real result IDs for testing (Development/Testing only)
 *     description: |
 *       Retrieve real result IDs from the database for testing other endpoints that require valid MongoDB ObjectIds.
 *       This endpoint is for development and testing purposes only.
 *       
 *       **Use Case:**
 *       - Get real result IDs to test `GET /api/result/:id` endpoint
 *       - Get real sample IDs to test `GET /api/result/sample/:sampleId` endpoint  
 *       - Get real appointment IDs to test `GET /api/result/appointment/:appointmentId` endpoint
 *       
 *       **Important Notes:**
 *       - **Read-only operation** - Only retrieves existing data
 *       - **Real data** - Returns actual result IDs from database
 *       - **Limited results** - Returns only first 5 results to avoid overwhelming response
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Real result IDs retrieved successfully for testing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Real result IDs retrieved for testing"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       description: Number of results returned
 *                       example: 3
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Valid MongoDB ObjectId for result
 *                             example: "60d21b4667d0d8992e610c85"
 *                           sample_ids:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: Array of sample IDs associated with this result
 *                             example: ["60c72b2f9b1e8b3b4c8d6e26", "60c72b2f9b1e8b3b4c8d6e27"]
 *                           appointment_id:
 *                             type: string
 *                             description: Appointment ID associated with this result
 *                             example: "5f8d0e0e9d3b9a0017c1a7a2"
 *                           customer_id:
 *                             type: string
 *                             description: Customer ID associated with this result
 *                             example: "60d21b4667d0d8992e610c83"
 *                           is_match:
 *                             type: boolean
 *                             description: Whether the DNA test result is a match
 *                             example: true
 *                           completed_at:
 *                             type: string
 *                             format: date-time
 *                             description: When the result was completed
 *                             example: "2024-01-20T10:30:00.000Z"
 *                     note:
 *                       type: string
 *                       example: "Use these real IDs to test GET /api/result/:id endpoint"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Access denied (Staff, Manager, or Admin access required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error - Database query failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */ 