/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAppointmentLogDto:
 *       type: object
 *       required:
 *         - appointment_id
 *         - customer_id
 *         - new_status
 *         - type
 *       properties:
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment being logged
 *           example: "60d0fe4f5311236168a109ce"
 *         customer_id:
 *           type: string
 *           description: ID of the customer associated with the appointment
 *           example: "60d0fe4f5311236168a109cf"
 *         staff_id:
 *           type: string
 *           description: ID of the staff member handling the appointment (optional)
 *           example: "60d0fe4f5311236168a109cc"
 *         laboratory_technician_id:
 *           type: string
 *           description: ID of the laboratory technician processing the sample (optional)
 *           example: "60d0fe4f5311236168a109cd"
 *         old_status:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, testing, completed, cancelled]
 *           description: Previous status of the appointment (optional)
 *           example: "pending"
 *         new_status:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, testing, completed, cancelled]
 *           description: New status of the appointment
 *           example: "confirmed"
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Type of sample collection
 *           example: "facility"
 *
 *     AppointmentLogResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique log identifier
 *           example: "60d0fe4f5311236168a109d0"
 *         appointment_id:
 *           type: object
 *           description: Associated appointment information
 *           properties:
 *             _id:
 *               type: string
 *               description: Appointment ID
 *               example: "60d0fe4f5311236168a109ce"
 *             service_id:
 *               type: string
 *               description: Service ID
 *               example: "60d0fe4f5311236168a109ca"
 *             status:
 *               type: string
 *               description: Current appointment status
 *               example: "confirmed"
 *         customer_id:
 *           type: object
 *           description: Customer information
 *           properties:
 *             _id:
 *               type: string
 *               description: Customer ID
 *               example: "60d0fe4f5311236168a109cf"
 *             first_name:
 *               type: string
 *               description: Customer's first name
 *               example: "John"
 *             last_name:
 *               type: string
 *               description: Customer's last name
 *               example: "Doe"
 *             email:
 *               type: string
 *               description: Customer's email
 *               example: "john.doe@example.com"
 *         staff_id:
 *           type: object
 *           description: Staff information (if assigned)
 *           properties:
 *             _id:
 *               type: string
 *               description: Staff ID
 *               example: "60d0fe4f5311236168a109cc"
 *             first_name:
 *               type: string
 *               description: Staff's first name
 *               example: "Jane"
 *             last_name:
 *               type: string
 *               description: Staff's last name
 *               example: "Smith"
 *         laboratory_technician_id:
 *           type: object
 *           description: Laboratory technician information (if assigned)
 *           properties:
 *             _id:
 *               type: string
 *               description: Laboratory technician ID
 *               example: "60d0fe4f5311236168a109cd"
 *             first_name:
 *               type: string
 *               description: Technician's first name
 *               example: "Mark"
 *             last_name:
 *               type: string
 *               description: Technician's last name
 *               example: "Johnson"
 *         old_status:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, testing, completed, cancelled]
 *           description: Previous status of the appointment
 *           example: "pending"
 *         new_status:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, testing, completed, cancelled]
 *           description: New status of the appointment
 *           example: "confirmed"
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Type of sample collection
 *           example: "facility"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Log creation date
 *           example: "2023-10-01T12:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Log last update date
 *           example: "2023-10-01T12:30:00Z"
 *
 *     AppointmentLogPaginationResponse:
 *       type: object
 *       properties:
 *         pageData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AppointmentLogResponse'
 *         pageInfo:
 *           type: object
 *           properties:
 *             totalItems:
 *               type: integer
 *               description: Total number of items
 *               example: 15
 *             totalPages:
 *               type: integer
 *               description: Total number of pages
 *               example: 2
 *             pageNum:
 *               type: integer
 *               description: Current page number
 *               example: 1
 *             pageSize:
 *               type: integer
 *               description: Number of items per page
 *               example: 10
 *
 *     SearchAppointmentLogParams:
 *       type: object
 *       properties:
 *         pageNum:
 *           type: integer
 *           description: Page number for pagination
 *           default: 1
 *           example: 1
 *         pageSize:
 *           type: integer
 *           description: Number of items per page
 *           default: 10
 *           example: 10
 *         old_status:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, testing, completed, cancelled]
 *           description: Filter by previous status
 *           example: "pending"
 *         new_status:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, testing, completed, cancelled]
 *           description: Filter by new status
 *           example: "confirmed"
 *         customer_id:
 *           type: string
 *           description: Filter logs by customer ID
 *           example: "60d0fe4f5311236168a109cf"
 *         staff_id:
 *           type: string
 *           description: Filter logs by staff ID
 *           example: "60d0fe4f5311236168a109cc"
 *         date_from:
 *           type: string
 *           format: date
 *           description: Filter logs from this date
 *           example: "2023-10-01"
 *         date_to:
 *           type: string
 *           format: date
 *           description: Filter logs until this date
 *           example: "2023-10-31"
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Filter by appointment type
 *           example: "facility"
 */
