/**
 * @swagger
 * tags:
 *   name: appointment-logs
 *   description: Appointment and consultation logging APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentLogResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Log entry unique identifier
 *           example: "60d0fe4f5311236168a109ce"
 *         customer_id:
 *           type: string
 *           description: Customer ID if applicable
 *           example: "60d0fe4f5311236168a109ca"
 *         staff_id:
 *           type: string
 *           description: Staff member ID if applicable
 *           example: "60d0fe4f5311236168a109cb"
 *         laboratory_technician_id:
 *           type: string
 *           description: Laboratory technician ID if applicable
 *           example: "60d0fe4f5311236168a109cc"
 *         appointment_id:
 *           type: string
 *           description: Related appointment ID if applicable
 *           example: "60d0fe4f5311236168a109cd"
 *         old_status:
 *           type: string
 *           enum: [pending, confirmed, sample_assigned, sample_collected, sample_received, testing, completed, cancelled, sample_created]
 *           description: Previous status
 *           example: "pending"
 *         new_status:
 *           type: string
 *           enum: [pending, confirmed, sample_assigned, sample_collected, sample_received, testing, completed, cancelled, sample_created]
 *           description: New status
 *           example: "confirmed"
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Type of appointment or consultation
 *           example: "home"
 *         notes:
 *           type: string
 *           description: Additional notes about the log entry
 *           example: "Consultation request created for Nguyễn Văn A - Subject: Tư vấn về xét nghiệm DNA dòng họ"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Log entry creation date
 *           example: "2024-01-15T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Log entry last update date
 *           example: "2024-01-15T10:00:00.000Z"
 *
 *     AppointmentLogListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Appointment logs retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             pageData:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AppointmentLogResponse'
 *             pageInfo:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   description: Total number of log entries
 *                   example: 100
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *                   example: 10
 *                 pageNum:
 *                   type: integer
 *                   description: Current page number
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   description: Number of items per page
 *                   example: 10
 */

/**
 * @swagger
 * /api/appointment-log/search:
 *   get:
 *     tags:
 *       - appointment-logs
 *     summary: Search appointment and consultation logs (Admin/Manager only)
 *     description: |
 *       Retrieve paginated list of appointment and consultation activity logs with filtering options.
 *       Includes logs for appointments, consultations, status changes, and staff assignments.
 *     operationId: searchAppointmentLogs
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by customer ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109ca"
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by staff ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109cb"
 *       - in: query
 *         name: appointment_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by appointment ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109cd"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [self, facility, home]
 *         description: Filter by appointment/consultation type
 *         example: "home"
 *       - in: query
 *         name: old_status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, sample_assigned, sample_collected, sample_received, testing, completed, cancelled, sample_created]
 *         description: Filter by previous status
 *         example: "pending"
 *       - in: query
 *         name: new_status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, sample_assigned, sample_collected, sample_received, testing, completed, cancelled, sample_created]
 *         description: Filter by new status
 *         example: "confirmed"
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs until this date (YYYY-MM-DD)
 *         example: "2024-12-31"
 *       - in: query
 *         name: search_term
 *         schema:
 *           type: string
 *         description: Search in log notes
 *         example: "consultation"
 *     responses:
 *       200:
 *         description: Appointment logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentLogListResponse'
 *             examples:
 *               success:
 *                 summary: Successful response with logs
 *                 value:
 *                   status: "success"
 *                   message: "Appointment logs retrieved successfully"
 *                   data:
 *                     pageData:
 *                       - _id: "60d0fe4f5311236168a109ce"
 *                         customer_id: "60d0fe4f5311236168a109ca"
 *                         staff_id: "60d0fe4f5311236168a109cb"
 *                         appointment_id: "60d0fe4f5311236168a109cd"
 *                         old_status: "pending"
 *                         new_status: "confirmed"
 *                         type: "home"
 *                         notes: "Appointment confirmed by staff member"
 *                         created_at: "2024-01-15T10:00:00.000Z"
 *                       - _id: "60d0fe4f5311236168a109cf"
 *                         staff_id: "60d0fe4f5311236168a109cb"
 *                         old_status: "pending"
 *                         new_status: "pending"
 *                         type: "home"
 *                         notes: "Consultation request created for Nguyễn Văn A - Subject: Tư vấn về xét nghiệm DNA"
 *                         created_at: "2024-01-15T09:30:00.000Z"
 *                     pageInfo:
 *                       totalItems: 100
 *                       totalPages: 10
 *                       pageNum: 1
 *                       pageSize: 10
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin/Manager access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/appointment-log/{id}:
 *   get:
 *     tags:
 *       - appointment-logs
 *     summary: Get appointment log by ID (Admin/Manager only)
 *     description: Retrieve detailed information about a specific appointment or consultation log entry
 *     operationId: getAppointmentLogById
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Log entry ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109ce"
 *     responses:
 *       200:
 *         description: Log entry details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Appointment log retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AppointmentLogResponse'
 *       400:
 *         description: Invalid log ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin/Manager access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Log entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */