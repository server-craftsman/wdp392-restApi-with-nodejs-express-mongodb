/**
 * @swagger
 * tags:
 *   name: administrative-cases
 *   description: Quản lý hồ sơ xét nghiệm DNA pháp lý - Vietnamese Legal DNA Testing Cases
 */

/**
 * @swagger
 * /api/administrative-cases:
 *   post:
 *     tags: 
 *       - administrative-cases
 *     summary: Tạo mới hồ sơ xét nghiệm DNA pháp lý
 *     description: |
 *       Tạo hồ sơ xét nghiệm DNA cho các vụ việc pháp lý được yêu cầu bởi cơ quan thẩm quyền.
 *       Chỉ ADMIN và MANAGER mới có quyền tạo hồ sơ.
 *       
 *       **Format số hồ sơ**: PL-YYYY-XXX (VD: PL-2024-001)
 *       **Format mã phép**: QD-YYYY-XXX (VD: QD-2024-001) 
 *       **Format số quyết định**: SO-XXX/YYYY (VD: SO-001/2024)
 *       **Format số điện thoại**: 0xxxxxxxxx (10 số)
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdministrativeCaseRequest'
 *           example:
 *             case_type: "paternity"
 *             urgency: "normal"
 *             requesting_agency: "Tòa án nhân dân TP.HCM"
 *             agency_address: "123 Lý Thường Kiệt, Q1, TP.HCM"
 *             agency_contact_name: "Thẩm phán Nguyễn Văn A"
 *             agency_contact_email: "judge.a@court.gov.vn"
 *             agency_contact_phone: "0123456789"
 *             authorization_code: "QD-2025-001"
 *             court_order_number: "SO-001/2025"
 *             authorization_date: "2025-01-15T00:00:00.000Z"
 *             case_description: "Xác định quan hệ cha con trong vụ án tranh chấp thừa kế"
 *             legal_purpose: "Phục vụ giải quyết tranh chấp thừa kế tài sản"
 *             expected_participants: 3
 *             participants:
 *               - name: "Nguyễn Văn B"
 *                 relationship: "Alleged Father"
 *                 id_number: "123456789"
 *                 phone: "0987654321"
 *                 address: "456 Nguyễn Huệ, Q1, TP.HCM"
 *                 is_required: true
 *               - name: "Trần Thị C"
 *                 relationship: "Child"
 *                 id_number: "987654321"
 *                 phone: "0111222333"
 *                 address: "789 Lê Lợi, Q1, TP.HCM"
 *                 is_required: true
 *             documents:
 *               - name: "Quyết định của Tòa án"
 *                 type: "court_order"
 *                 file_url: "https://s3.amazonaws.com/bucket/court_order.pdf"
 *     responses:
 *       201:
 *         description: Tạo hồ sơ thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdministrativeCaseResponse'
 *       400:
 *         description: Lỗi validation hoặc case number đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed: case_number must be in format PL-YYYY-XXX"
 *       403:
 *         description: Không có quyền truy cập
 *       401:
 *         description: Chưa đăng nhập
 *   get:
 *     tags: 
 *       - administrative-cases
 *     summary: Lấy danh sách hồ sơ pháp lý
 *     description: "Lấy tất cả hồ sơ xét nghiệm DNA pháp lý (không bao gồm hồ sơ đã xóa)"
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, submitted, under_review, approved, denied, scheduled, in_progress, completed, result_issued, archived]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: case_type
 *         schema:
 *           type: string
 *           enum: [paternity, maternity, sibling, kinship, immigration, inheritance, criminal_case, civil_case, missing_person]
 *         description: Lọc theo loại vụ việc
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *         description: Lọc theo mức độ khẩn cấp
 *     responses:
 *       200:
 *         description: Danh sách hồ sơ
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
 *                     $ref: '#/components/schemas/AdministrativeCaseResponse'
 *                 message:
 *                   type: string
 *                   example: "Administrative cases retrieved successfully"
 *       403:
 *         description: Không có quyền truy cập
 */

/**
 * @swagger
 * /api/administrative-cases/search:
 *   get:
 *     tags: 
 *       - administrative-cases
 *     summary: Tìm kiếm hồ sơ pháp lý theo nhiều tiêu chí
 *     description: Tìm kiếm hồ sơ theo số hồ sơ, cơ quan yêu cầu, email, thời gian tạo, v.v.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: case_number
 *         schema:
 *           type: string
 *         description: "Tìm kiếm theo số hồ sơ (hỗ trợ partial match)"
 *         example: "PL-2025-001"
 *       - in: query
 *         name: case_type
 *         schema:
 *           type: string
 *           enum: [paternity, maternity, sibling, kinship, immigration, inheritance, criminal_case, civil_case, missing_person]
 *         description: Lọc theo loại vụ việc
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, submitted, under_review, approved, denied, scheduled, in_progress, completed, result_issued, archived]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: requesting_agency
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên cơ quan yêu cầu
 *         example: "Tòa án"
 *       - in: query
 *         name: agency_contact_email
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo email liên hệ
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: "Tìm kiếm từ ngày (YYYY-MM-DD)"
 *         example: "2025-01-01"
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: "Đến ngày (YYYY-MM-DD)"
 *         example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
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
 *                     $ref: '#/components/schemas/AdministrativeCaseResponse'
 *                 message:
 *                   type: string
 *                   example: "Administrative cases search completed"
 */

/**
 * @swagger
 * /api/administrative-cases/generate-case-number:
 *   get:
 *     tags: 
 *       - administrative-cases
 *     summary: Tạo số hồ sơ tự động
 *     description: Tạo số hồ sơ theo format PL-YYYY-XXX với option sequential hoặc timestamp
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: sequential
 *         schema:
 *           type: boolean
 *         description: "Sử dụng số thứ tự tuần tự (true) hoặc timestamp (false)"
 *         example: true
 *     responses:
 *       200:
 *         description: Số hồ sơ được tạo thành công
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
 *                     case_number:
 *                       type: string
 *                       example: "PL-2024-001"
 *                 message:
 *                   type: string
 *                   example: "Case number generated successfully"
 */

/**
 * @swagger
 * /api/administrative-cases/case-number/{caseNumber}:
 *   get:
 *     tags: 
 *       - administrative-cases
 *     summary: Lấy hồ sơ theo số hồ sơ
 *     description: "Tìm hồ sơ bằng số hồ sơ (case_number)"
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: caseNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Số hồ sơ
 *         example: "PL-2024-001"
 *     responses:
 *       200:
 *         description: Thông tin hồ sơ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdministrativeCaseResponse'
 *       404:
 *         description: Không tìm thấy hồ sơ
 */

/**
 * @swagger
 * /api/administrative-cases/{id}:
 *   get:
 *     tags: 
 *       - administrative-cases
 *     summary: Lấy chi tiết hồ sơ theo ID
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hồ sơ
 *         example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Thông tin chi tiết hồ sơ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdministrativeCaseResponse'
 *       404:
 *         description: Không tìm thấy hồ sơ
 *       400:
 *         description: ID không hợp lệ
 *   put:
 *     tags: 
 *       - administrative-cases
 *     summary: Cập nhật hồ sơ
 *     description: Cập nhật thông tin hồ sơ xét nghiệm DNA pháp lý
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hồ sơ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdministrativeCaseRequest'
 *           example:
 *             case_description: "Cập nhật mô tả chi tiết vụ việc"
 *             urgency: "high"
 *             agency_notes: "Yêu cầu xử lý gấp"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdministrativeCaseResponse'
 *       400:
 *         description: Lỗi validation
 *       404:
 *         description: Không tìm thấy hồ sơ
 *       403:
 *         description: Không có quyền truy cập
 *   delete:
 *     tags: 
 *       - administrative-cases
 *     summary: Xóa hồ sơ (soft delete)
 *     description: "Đánh dấu hồ sơ là đã xóa (không xóa vĩnh viễn)"
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hồ sơ
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Administrative case deleted successfully"
 *       404:
 *         description: Không tìm thấy hồ sơ
 *       403:
 *         description: Không có quyền truy cập
 */

/**
 * @swagger
 * /api/administrative-cases/{id}/status:
 *   put:
 *     tags: 
 *       - administrative-cases
 *     summary: Cập nhật trạng thái hồ sơ
 *     description: |
 *       Cập nhật trạng thái của hồ sơ và tự động ghi nhận thời gian thay đổi:
 *       - submitted: Ghi nhận submitted_at
 *       - under_review: Ghi nhận reviewed_at  
 *       - approved: Ghi nhận approved_at
 *       - scheduled: Ghi nhận scheduled_at
 *       - completed: Ghi nhận completed_at
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hồ sơ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, submitted, under_review, approved, denied, scheduled, in_progress, completed, result_issued, archived]
 *                 description: Trạng thái mới
 *                 example: "approved"
 *           example:
 *             status: "approved"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdministrativeCaseResponse'
 *       400:
 *         description: Thiếu thông tin status hoặc status không hợp lệ
 *       404:
 *         description: Không tìm thấy hồ sơ
 *       403:
 *         description: Không có quyền truy cập
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     CaseParticipant:
 *       type: object
 *       required:
 *         - name
 *         - relationship
 *       properties:
 *         name:
 *           type: string
 *           description: Họ tên người tham gia
 *           example: "Nguyễn Văn B"
 *         relationship:
 *           type: string
 *           description: Mối quan hệ với vụ việc
 *           example: "Alleged Father"
 *         id_number:
 *           type: string
 *           description: Số CMND/CCCD
 *           example: "123456789"
 *         phone:
 *           type: string
 *           description: Số điện thoại
 *           example: "0987654321"
 *         email:
 *           type: string
 *           description: Email
 *           example: "participant@email.com"
 *         address:
 *           type: string
 *           description: Địa chỉ
 *           example: "456 Nguyễn Huệ, Q1, TP.HCM"
 *         is_required:
 *           type: boolean
 *           description: Có bắt buộc tham gia không
 *           example: true
 *         consent_provided:
 *           type: boolean
 *           description: Đã đồng ý tham gia chưa
 *           example: false
 *         sample_collected:
 *           type: boolean
 *           description: Đã lấy mẫu chưa
 *           example: false
 *     CaseDocument:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - file_url
 *       properties:
 *         name:
 *           type: string
 *           description: Tên tài liệu
 *           example: "Quyết định của Tòa án"
 *         type:
 *           type: string
 *           description: Loại tài liệu
 *           example: "court_order"
 *         file_url:
 *           type: string
 *           description: Đường dẫn file
 *           example: "https://s3.amazonaws.com/bucket/court_order.pdf"
 *         uploaded_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian upload
 *         verified:
 *           type: boolean
 *           description: Đã xác minh tài liệu chưa
 *           example: false
 *     CreateAdministrativeCaseRequest:
 *       type: object
 *       required:
 *         - case_number
 *         - case_type
 *         - urgency
 *         - requesting_agency
 *         - agency_address
 *         - agency_contact_name
 *         - agency_contact_email
 *         - agency_contact_phone
 *         - case_description
 *         - legal_purpose
 *         - expected_participants
 *         - participants
 *       properties:
 *         case_number:
 *           type: string
 *           pattern: '^PL-\d{4}-\d{3}$'
 *           description: "Số hồ sơ (Format: PL-YYYY-XXX)"
 *           example: "PL-2024-001"
 *         case_type:
 *           type: string
 *           enum: [paternity, maternity, sibling, kinship, immigration, inheritance, criminal_case, civil_case, missing_person]
 *           description: Loại vụ việc
 *           example: "paternity"
 *         urgency:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *           description: Mức độ khẩn cấp
 *           example: "normal"
 *         requesting_agency:
 *           type: string
 *           description: Tên cơ quan yêu cầu
 *           example: "Tòa án nhân dân TP.HCM"
 *         agency_address:
 *           type: string
 *           description: Địa chỉ cơ quan
 *           example: "123 Lý Thường Kiệt, Q1, TP.HCM"
 *         agency_contact_name:
 *           type: string
 *           description: Tên người liên hệ
 *           example: "Thẩm phán Nguyễn Văn A"
 *         agency_contact_email:
 *           type: string
 *           format: email
 *           description: Email liên hệ
 *           example: "judge.a@court.gov.vn"
 *         agency_contact_phone:
 *           type: string
 *           pattern: '^0\d{9}$'
 *           description: "Số điện thoại (10 số, bắt đầu bằng 0)"
 *           example: "0123456789"
 *         authorization_code:
 *           type: string
 *           pattern: '^QD-\d{4}-\d{3}$'
 *           description: "Số phép (Format: QD-YYYY-XXX)"
 *           example: "QD-2024-001"
 *         court_order_number:
 *           type: string
 *           pattern: '^SO-\d{3}/\d{4}$'
 *           description: "Số quyết định tòa án (Format: SO-XXX/YYYY)"
 *           example: "SO-001/2024"
 *         authorization_date:
 *           type: string
 *           format: date-time
 *           description: Ngày phê duyệt
 *           example: "2024-01-15T00:00:00.000Z"
 *         case_description:
 *           type: string
 *           description: Mô tả chi tiết vụ việc
 *           example: "Xác định quan hệ cha con trong vụ án tranh chấp thừa kế"
 *         legal_purpose:
 *           type: string
 *           description: Mục đích pháp lý
 *           example: "Phục vụ giải quyết tranh chấp thừa kế tài sản"
 *         expected_participants:
 *           type: number
 *           minimum: 1
 *           description: Số người dự kiến tham gia
 *           example: 3
 *         participants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CaseParticipant'
 *           description: Danh sách người tham gia
 *           minItems: 1
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CaseDocument'
 *           description: Các tài liệu đính kèm
 *         agency_notes:
 *           type: string
 *           description: Ghi chú từ cơ quan
 *         internal_notes:
 *           type: string
 *           description: Ghi chú nội bộ
 *         denial_reason:
 *           type: string
 *           description: "Lý do từ chối (nếu có)"
 *         assigned_staff_id:
 *           type: string
 *           description: ID nhân viên được giao
 *         result_delivery_method:
 *           type: string
 *           enum: [pickup, mail, email]
 *           description: Phương thức giao kết quả
 *         result_recipient:
 *           type: string
 *           description: Người nhận kết quả
 *     UpdateAdministrativeCaseRequest:
 *       type: object
 *       properties:
 *         case_type:
 *           type: string
 *           enum: [paternity, maternity, sibling, kinship, immigration, inheritance, criminal_case, civil_case, missing_person]
 *           description: Loại vụ việc
 *         urgency:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *           description: Mức độ khẩn cấp
 *         requesting_agency:
 *           type: string
 *           description: Tên cơ quan yêu cầu
 *         agency_address:
 *           type: string
 *           description: Địa chỉ cơ quan
 *         agency_contact_name:
 *           type: string
 *           description: Tên người liên hệ
 *         agency_contact_email:
 *           type: string
 *           format: email
 *           description: Email liên hệ
 *         agency_contact_phone:
 *           type: string
 *           pattern: '^0\d{9}$'
 *           description: "Số điện thoại (10 số, bắt đầu bằng 0)"
 *         authorization_code:
 *           type: string
 *           pattern: '^QD-\d{4}-\d{3}$'
 *           description: "Số phép (Format: QD-YYYY-XXX)"
 *         court_order_number:
 *           type: string
 *           pattern: '^SO-\d{3}/\d{4}$'
 *           description: "Số quyết định tòa án (Format: SO-XXX/YYYY)"
 *         authorization_date:
 *           type: string
 *           format: date-time
 *           description: Ngày phê duyệt
 *         case_description:
 *           type: string
 *           description: Mô tả chi tiết vụ việc
 *         legal_purpose:
 *           type: string
 *           description: Mục đích pháp lý
 *         expected_participants:
 *           type: number
 *           minimum: 1
 *           description: Số người dự kiến tham gia
 *         participants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CaseParticipant'
 *           description: Danh sách người tham gia
 *         documents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CaseDocument'
 *           description: Các tài liệu đính kèm
 *         agency_notes:
 *           type: string
 *           description: Ghi chú từ cơ quan
 *         internal_notes:
 *           type: string
 *           description: Ghi chú nội bộ
 *         denial_reason:
 *           type: string
 *           description: Lý do từ chối
 *         assigned_staff_id:
 *           type: string
 *           description: ID nhân viên được giao
 *         result_delivery_method:
 *           type: string
 *           enum: [pickup, mail, email]
 *           description: Phương thức giao kết quả
 *         result_recipient:
 *           type: string
 *           description: Người nhận kết quả
 *         status:
 *           type: string
 *           enum: [draft, submitted, under_review, approved, denied, scheduled, in_progress, completed, result_issued, archived]
 *           description: Trạng thái vụ việc
 *     AdministrativeCaseResponse:
 *       allOf:
 *         - type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             data:
 *               $ref: '#/components/schemas/AdministrativeCase'
 *             message:
 *               type: string
 *               example: "Administrative case retrieved successfully"
 *     AdministrativeCase:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateAdministrativeCaseRequest'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: ID của hồ sơ
 *               example: "60d0fe4f5311236168a109ca"
 *             status:
 *               type: string
 *               enum: [draft, submitted, under_review, approved, denied, scheduled, in_progress, completed, result_issued, archived]
 *               description: Trạng thái vụ việc
 *               example: "draft"
 *             submitted_at:
 *               type: string
 *               format: date-time
 *               description: Thời gian nộp hồ sơ
 *               example: "2024-01-16T08:00:00.000Z"
 *             reviewed_at:
 *               type: string
 *               format: date-time
 *               description: Thời gian xem xét
 *               example: "2024-01-17T10:30:00.000Z"
 *             approved_at:
 *               type: string
 *               format: date-time
 *               description: Thời gian phê duyệt
 *               example: "2024-01-18T14:15:00.000Z"
 *             scheduled_at:
 *               type: string
 *               format: date-time
 *               description: Thời gian đặt lịch
 *               example: "2024-01-19T09:00:00.000Z"
 *             completed_at:
 *               type: string
 *               format: date-time
 *               description: Thời gian hoàn thành
 *               example: "2024-01-25T16:30:00.000Z"
 *             appointment_ids:
 *               type: array
 *               items:
 *                 type: string
 *               description: Danh sách ID lịch hẹn
 *               example: ["60d0fe4f5311236168a109cb", "60d0fe4f5311236168a109cc"]
 *             created_by_user_id:
 *               type: string
 *               description: ID người tạo
 *               example: "60d0fe4f5311236168a109cd"
 *             assigned_staff_id:
 *               type: string
 *               description: ID nhân viên được giao
 *               example: "60d0fe4f5311236168a109ce"
 *             result_delivered_at:
 *               type: string
 *               format: date-time
 *               description: Thời gian giao kết quả
 *               example: "2024-01-26T10:00:00.000Z"
 *             is_deleted:
 *               type: boolean
 *               description: Đã bị xóa chưa
 *               example: false
 *             created_at:
 *               type: string
 *               format: date-time
 *               description: Thời gian tạo
 *               example: "2024-01-15T09:00:00.000Z"
 *             updated_at:
 *               type: string
 *               format: date-time
 *               description: Thời gian cập nhật cuối
 *               example: "2024-01-26T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/administrative-cases/assigned/search:
 *   get:
 *     tags: [administrative-cases]
 *     summary: Tìm kiếm vụ việc hành chính được giao cho Staff/LabTech
 *     description: |
 *       Tìm kiếm các vụ việc hành chính được Admin giao cho Staff hoặc Laboratory Technician.
 *       
 *       **Giới hạn truy cập:**
 *       - Chỉ Staff và Laboratory Technician mới có thể truy cập
 *       - Chỉ tìm kiếm trong các vụ việc được giao cho chính mình
 *       - Chỉ hiển thị một số loại vụ việc nhất định (paternity, maternity, sibling, kinship, immigration, inheritance)
 *       
 *       **Tham số tìm kiếm:**
 *       - case_number: Số vụ việc
 *       - case_type: Loại vụ việc (chỉ trong phạm vi cho phép)
 *       - status: Trạng thái vụ việc
 *       - requesting_agency: Cơ quan yêu cầu
 *       - from_date: Từ ngày
 *       - to_date: Đến ngày
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: case_number
 *         schema:
 *           type: string
 *         description: Số vụ việc để tìm kiếm
 *         example: "PL-2024-001"
 *       - in: query
 *         name: case_type
 *         schema:
 *           type: string
 *           enum: [paternity, maternity, sibling, kinship, immigration, inheritance]
 *         description: "Loại vụ việc (chỉ trong phạm vi cho phép)"
 *         example: "paternity"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, under_review, approved, scheduled, in_progress, completed]
 *         description: Trạng thái vụ việc
 *         example: "approved"
 *       - in: query
 *         name: requesting_agency
 *         schema:
 *           type: string
 *         description: Cơ quan yêu cầu
 *         example: "Tòa án nhân dân TP.HCM"
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: "Từ ngày (YYYY-MM-DD)"
 *         example: "2024-01-01"
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: "Đến ngày (YYYY-MM-DD)"
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Tìm kiếm vụ việc được giao thành công
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
 *                     $ref: '#/components/schemas/AdministrativeCase'
 *                 message:
 *                   type: string
 *                   example: "Assigned administrative cases search completed"
 *       401:
 *         description: Chưa đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: "Không có quyền truy cập (chỉ Staff/LabTech)"
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
 * /api/administrative-cases/{id}/assign:
 *   put:
 *     tags: [administrative-cases]
 *     summary: Giao vụ việc hành chính cho Staff/LabTech (Admin/Manager)
 *     description: |
 *       Giao một vụ việc hành chính cho Staff hoặc Laboratory Technician để xử lý.
 *       
 *       **Quyền truy cập:**
 *       - Chỉ Admin và Manager mới có thể giao vụ việc
 *       - Staff/LabTech sẽ chỉ thấy vụ việc được giao cho mình
 *       
 *       **Lưu ý:**
 *       - Vụ việc sẽ được hiển thị trong danh sách assigned cases của Staff/LabTech
 *       - Chỉ các loại vụ việc phù hợp mới được giao (paternity, maternity, sibling, kinship, immigration, inheritance)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID vụ việc hành chính
 *         example: "60d21b4667d0d8992e610c85"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assigned_staff_id
 *             properties:
 *               assigned_staff_id:
 *                 type: string
 *                 description: ID của Staff hoặc Laboratory Technician được giao
 *                 example: "60d21b4667d0d8992e610c86"
 *           example:
 *             assigned_staff_id: "60d21b4667d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Giao vụ việc thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AdministrativeCase'
 *                 message:
 *                   type: string
 *                   example: "Case assigned to staff successfully"
 *       400:
 *         description: |
 *           Lỗi yêu cầu:
 *           - Thiếu Case ID hoặc Staff ID
 *           - Staff ID không hợp lệ
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
 *         description: "Không có quyền giao vụ việc (chỉ Admin/Manager)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy vụ việc hành chính
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
