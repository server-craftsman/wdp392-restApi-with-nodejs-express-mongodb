/**
 * @swagger
 * tags:
 *   name: appointment-logs
 *   description: Appointment log management and tracking APIs
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
 * /api/appointment-logs/appointment/{appointmentId}:
 *   get:
 *     tags:
 *       - appointment-logs
 *     summary: Get logs for a specific appointment (for admin, manager, staff and lab tech)
 *     description: |
 *       Retrieve paginated logs for a specific appointment including all status changes,
 *       staff assignments, check-ins, and administrative actions.
 *     operationId: getAppointmentLogs
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "60d0fe4f5311236168a109ce"
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
 *     responses:
 *       200:
 *         description: Appointment logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentLogListResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment-logs/appointment/{appointmentId}/timeline:
 *   get:
 *     tags:
 *       - appointment-logs
 *     summary: Get chronological timeline for appointment (for admin, manager, staff and lab tech)
 *     description: |
 *       Retrieve complete chronological activity timeline for an appointment,
 *       showing all actions in the order they occurred.
 *     operationId: getAppointmentTimeline
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "60d0fe4f5311236168a109ce"
 *     responses:
 *       200:
 *         description: Appointment timeline retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentTimelineResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment-logs/administrative-case/{caseId}:
 *   get:
 *     tags:
 *       - appointment-logs
 *     summary: Get logs for an administrative case (for admin, manager, staff and lab tech)
 *     description: |
 *       Retrieve paginated logs for all appointments associated with a specific
 *       administrative/legal case, including case progress updates and agency notifications.
 *     operationId: getAdministrativeCaseLogs
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Administrative case ID
 *         example: "60d0fe4f5311236168a109ce"
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
 *     responses:
 *       200:
 *         description: Administrative case logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentLogListResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions (Admin/Manager/Staff only)
 *       404:
 *         description: Administrative case not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment-logs/action/{action}:
 *   get:
 *     tags:
 *       - appointment-logs
 *     summary: Get logs by action type (for admin, manager)
 *     description: |
 *       Retrieve paginated logs filtered by specific action type.
 *       Useful for analyzing patterns and generating reports.
 *     operationId: getLogsByAction
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [create, update_status, assign_staff, assign_lab_tech, checkin, add_note, confirm, cancel, authorize, progress_update, agency_notification]
 *         description: Action type to filter by
 *         example: "checkin"
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
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentLogListResponse'
 *       400:
 *         description: Invalid action type
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions (Admin/Manager only)
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment-logs/statistics:
 *   get:
 *     tags:
 *       - appointment-logs
 *     summary: Get log statistics for dashboard (for admin, manager)
 *     description: |
 *       Retrieve statistical data about appointment logs for dashboard and reporting purposes.
 *       Includes counts by action type, status, and administrative appointments.
 *     operationId: getLogStatistics
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (YYYY-MM-DD)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Log statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogStatisticsResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions (Admin/Manager only)
 *       500:
 *         description: Internal server error
 */