/**
 * @swagger
 * components:
 *   schemas:
 *     CreateServiceDto:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - type
 *         - sample_method
 *         - estimated_time
 *       properties:
 *         name:
 *           type: string
 *           description: service name
 *           example: "DNA Test"
 *         description:
 *           type: string
 *           description: service description
 *           example: "Dịch vụ xét nghiệm ADN để xác định mối quan hệ huyết thống giữa cha/mẹ và con"
 *         parent_service_id:
 *           type: string
 *           description: ID của dịch vụ cha (nếu có)
 *           example: "60d5ec9af682fbd12a0f4a2c"
 *         price:
 *           type: number
 *           description: Giá dịch vụ
 *           example: 3500000
 *         type:
 *           type: string
 *           enum: [civil, administrative]
 *           description: Loại dịch vụ
 *           example: "civil"
 *         sample_method:
 *           type: string
 *           enum: [self_collected, facility_collected, home_collected]
 *           description: sample method
 *           example: "facility_collected"
 *         estimated_time:
 *           type: number
 *           description: estimated time
 *           example: 72
 *
 *     UpdateServiceDto:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - type
 *         - sample_method
 *         - estimated_time
 *       properties:
 *         name:
 *           type: string
 *           description: Tên dịch vụ
 *           example: "Xét nghiệm ADN xác định huyết thống"
 *         description:
 *           type: string
 *           description: Mô tả chi tiết về dịch vụ
 *           example: "Dịch vụ xét nghiệm ADN để xác định mối quan hệ huyết thống giữa cha/mẹ và con"
 *         parent_service_id:
 *           type: string
 *           description: ID của dịch vụ cha (nếu có)
 *           example: "60d5ec9af682fbd12a0f4a2c"
 *         price:
 *           type: number
 *           description: Giá dịch vụ
 *           example: 3500000
 *         type:
 *           type: string
 *           enum: [civil, administrative]
 *           description: Loại dịch vụ
 *           example: "civil"
 *         sample_method:
 *           type: string
 *           enum: [self_collected, facility_collected, home_collected]
 *           description: Phương thức thu thập mẫu
 *           example: "facility_collected"
 *         estimated_time:
 *           type: number
 *           description: Thời gian ước tính để hoàn thành dịch vụ (tính bằng giờ)
 *           example: 72
 *
 *     ServiceResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID dịch vụ
 *           example: "60d5ec9af682fbd12a0f4a3d"
 *         name:
 *           type: string
 *           description: Tên dịch vụ
 *           example: "Xét nghiệm ADN xác định huyết thống"
 *         description:
 *           type: string
 *           description: Mô tả chi tiết về dịch vụ
 *           example: "Dịch vụ xét nghiệm ADN để xác định mối quan hệ huyết thống giữa cha/mẹ và con"
 *         parent_service_id:
 *           type: string
 *           description: ID của dịch vụ cha (nếu có)
 *           example: "60d5ec9af682fbd12a0f4a2c"
 *         price:
 *           type: number
 *           description: Giá dịch vụ
 *           example: 3500000
 *         type:
 *           type: string
 *           enum: [civil, administrative]
 *           description: Loại dịch vụ
 *           example: "civil"
 *         sample_method:
 *           type: string
 *           enum: [self_collected, facility_collected, home_collected]
 *           description: Phương thức thu thập mẫu
 *           example: "facility_collected"
 *         estimated_time:
 *           type: number
 *           description: Thời gian ước tính để hoàn thành dịch vụ (tính bằng giờ)
 *           example: 72
 *         is_active:
 *           type: boolean
 *           description: Trạng thái hoạt động của dịch vụ
 *           example: true
 *         is_deleted:
 *           type: boolean
 *           description: Trạng thái xóa của dịch vụ
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo
 *           example: "2023-07-15T09:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Ngày cập nhật gần nhất
 *           example: "2023-07-16T14:20:00.000Z"
 *
 *     ServicePaginationResponse:
 *       type: object
 *       properties:
 *         pageData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ServiceResponse'
 *         pageInfo:
 *           type: object
 *           properties:
 *             totalItems:
 *               type: integer
 *               description: Tổng số dịch vụ
 *               example: 45
 *             totalPages:
 *               type: integer
 *               description: Tổng số trang
 *               example: 5
 *             pageNum:
 *               type: integer
 *               description: Số trang hiện tại
 *               example: 1
 *             pageSize:
 *               type: integer
 *               description: Số lượng dịch vụ mỗi trang
 *               example: 10
 *
 *     ServiceStatisticsResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Tổng số dịch vụ
 *           example: 45
 *         byType:
 *           type: object
 *           description: Số lượng dịch vụ theo loại
 *           properties:
 *             civil:
 *               type: integer
 *               example: 30
 *             administrative:
 *               type: integer
 *               example: 15
 *         byStatus:
 *           type: object
 *           description: Số lượng dịch vụ theo trạng thái
 *           properties:
 *             active:
 *               type: integer
 *               example: 40
 *             inactive:
 *               type: integer
 *               example: 5
 *         bySampleMethod:
 *           type: object
 *           description: Số lượng dịch vụ theo phương thức thu thập mẫu
 *           properties:
 *             self_collected:
 *               type: integer
 *               example: 15
 *             facility_collected:
 *               type: integer
 *               example: 20
 *             home_collected:
 *               type: integer
 *               example: 10
 */
