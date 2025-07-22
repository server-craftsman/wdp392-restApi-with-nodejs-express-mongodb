/**
 * @swagger
 * components:
 *   schemas:
 *     CreateConsultationDto:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - phone_number
 *         - type
 *         - subject
 *       properties:
 *         first_name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Customer's first name
 *           example: "Nguyễn"
 *         last_name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Customer's last name
 *           example: "Văn A"
 *         email:
 *           type: string
 *           format: email
 *           description: Customer's email address
 *           example: "nguyenvana@example.com"
 *         phone_number:
 *           type: string
 *           minLength: 10
 *           maxLength: 15
 *           description: Customer's phone number
 *           example: "0901234567"
 *         type:
 *           type: string
 *           enum: [HOME, FACILITY]
 *           description: Type of consultation location
 *           example: "HOME"
 *         collection_address:
 *           type: string
 *           maxLength: 500
 *           description: Address for home consultation (required if type is HOME)
 *           example: "123 Đường ABC, Quận 1, TP.HCM"
 *         preferred_date:
 *           type: string
 *           format: date
 *           description: Preferred consultation date
 *           example: "2024-02-15"
 *         consultation_notes:
 *           type: string
 *           maxLength: 1000
 *           description: Additional notes or questions
 *           example: "Tôi muốn tìm hiểu về dịch vụ xét nghiệm DNA dòng họ và chi phí liên quan"
 *         preferred_time:
 *           type: string
 *           maxLength: 200
 *           description: Preferred consultation time
 *           example: "9:00 AM - 11:00 AM"
 *         subject:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           description: Consultation subject/topic
 *           example: "Tư vấn về xét nghiệm DNA dòng họ"
 *
 *     ConsultationResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Consultation unique identifier
 *           example: "60d0fe4f5311236168a109ce"
 *         first_name:
 *           type: string
 *           description: Customer's first name
 *           example: "Nguyễn"
 *         last_name:
 *           type: string
 *           description: Customer's last name
 *           example: "Văn A"
 *         email:
 *           type: string
 *           description: Customer's email address
 *           example: "nguyenvana@example.com"
 *         phone_number:
 *           type: string
 *           description: Customer's phone number
 *           example: "0901234567"
 *         type:
 *           type: string
 *           enum: [HOME, FACILITY]
 *           description: Type of consultation location
 *           example: "HOME"
 *         collection_address:
 *           type: string
 *           description: Address for home consultation
 *           example: "123 Đường ABC, Quận 1, TP.HCM"
 *         subject:
 *           type: string
 *           description: Consultation subject/topic
 *           example: "Tư vấn về xét nghiệm DNA dòng họ"
 *         consultation_notes:
 *           type: string
 *           description: Additional notes or questions
 *           example: "Tôi muốn tìm hiểu về dịch vụ xét nghiệm DNA"
 *         preferred_date:
 *           type: string
 *           format: date-time
 *           description: Preferred consultation date
 *           example: "2024-02-15T00:00:00.000Z"
 *         preferred_time:
 *           type: string
 *           description: Preferred consultation time
 *           example: "9:00 AM - 11:00 AM"
 *         consultation_status:
 *           type: string
 *           enum: [REQUESTED, ASSIGNED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, FOLLOW_UP_REQUIRED]
 *           description: Current status of the consultation
 *           example: "REQUESTED"
 *         assigned_consultant_id:
 *           type: object
 *           description: Assigned consultant information
 *           properties:
 *             _id:
 *               type: string
 *               example: "60d0fe4f5311236168a109ca"
 *             first_name:
 *               type: string
 *               example: "Lê"
 *             last_name:
 *               type: string
 *               example: "Thị B"
 *             email:
 *               type: string
 *               example: "consultant@example.com"
 *         meeting_link:
 *           type: string
 *           description: Video meeting link for consultation
 *           example: "https://meet.google.com/abc-def-ghi"
 *         meeting_notes:
 *           type: string
 *           description: Notes from the consultation meeting
 *           example: "Đã tư vấn về quy trình xét nghiệm DNA"
 *         follow_up_required:
 *           type: boolean
 *           description: Whether a follow-up consultation is needed
 *           example: false
 *         follow_up_date:
 *           type: string
 *           format: date-time
 *           description: Date for follow-up consultation
 *           example: "2024-02-22T10:00:00.000Z"
 *         appointment_date:
 *           type: string
 *           format: date-time
 *           description: Scheduled consultation date and time
 *           example: "2024-02-15T10:00:00.000Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Consultation request creation date
 *           example: "2024-01-15T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *           example: "2024-01-15T10:00:00.000Z"
 *
 *     ConsultationListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Consultation requests retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             pageData:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ConsultationResponse'
 *             pageInfo:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   description: Total number of consultations
 *                   example: 50
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *                   example: 5
 *                 pageNum:
 *                   type: integer
 *                   description: Current page number
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   description: Number of items per page
 *                   example: 10
 *
 *     AssignConsultantRequest:
 *       type: object
 *       required:
 *         - consultant_id
 *       properties:
 *         consultant_id:
 *           type: string
 *           description: ID of the staff member to assign as consultant
 *           example: "60d0fe4f5311236168a109ca"
 *
 *     UpdateConsultationStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [REQUESTED, ASSIGNED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, FOLLOW_UP_REQUIRED]
 *           description: New consultation status
 *           example: "SCHEDULED"
 *         appointment_date:
 *           type: string
 *           format: date-time
 *           description: Scheduled consultation date and time
 *           example: "2024-02-15T10:00:00.000Z"
 *         meeting_link:
 *           type: string
 *           description: Video meeting link for consultation
 *           example: "https://meet.google.com/abc-def-ghi"
 *         meeting_notes:
 *           type: string
 *           description: Notes about the consultation
 *           example: "Cuộc họp tư vấn về quy trình xét nghiệm"
 *         follow_up_required:
 *           type: boolean
 *           description: Whether a follow-up consultation is needed
 *           example: true
 *         follow_up_date:
 *           type: string
 *           format: date-time
 *           description: Date for follow-up consultation
 *           example: "2024-02-22T10:00:00.000Z"
 *
 *     ConsultationSuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Consultation request created successfully"
 *         data:
 *           $ref: '#/components/schemas/ConsultationResponse'
 */
