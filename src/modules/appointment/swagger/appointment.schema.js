/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAppointmentDto:
 *       type: object
 *       required:
 *         - service_id
 *         - type
 *       properties:
 *         service_id:
 *           type: string
 *           description: ID of the service being booked
 *           example: "60d0fe4f5311236168a109ca"
 *         slot_id:
 *           type: string
 *           description: ID of the timeslot (optional if appointment_date is provided)
 *           example: "60d0fe4f5311236168a109cb"
 *         appointment_date:
 *           type: string
 *           format: date-time
 *           description: Appointment date and time (optional if slot_id is provided)
 *           example: "2023-10-15T14:30:00Z"
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Type of sample collection
 *           example: "facility"
 *         collection_address:
 *           type: string
 *           description: Address for home collection (required when type is 'home')
 *           example: "123 Main St, City, Country"
 *
 *     AssignStaffDto:
 *       type: object
 *       required:
 *         - staff_id
 *       properties:
 *         staff_id:
 *           type: string
 *           description: ID of the staff member to assign to the appointment
 *           example: "60d0fe4f5311236168a109cc"
 *
 *     ConfirmAppointmentDto:
 *       type: object
 *       required:
 *         - kit_id
 *         - laboratory_technician_id
 *       properties:
 *         kit_id:
 *           type: string
 *           description: ID of the testing kit to assign to the appointment
 *           example: "60d0fe4f5311236168a109cd"
 *         laboratory_technician_id:
 *           type: string
 *           description: ID of the laboratory technician to assign the kit to
 *           example: "60d0fe4f5311236168a109dd"
 *
 *     AppointmentResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique appointment identifier
 *           example: "60d0fe4f5311236168a109ce"
 *         user_id:
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
 *             phone_number:
 *               type: string
 *               description: Customer's phone number
 *               example: "+84912345678"
 *         service_id:
 *           type: object
 *           description: Service information
 *           properties:
 *             _id:
 *               type: string
 *               description: Service ID
 *               example: "60d0fe4f5311236168a109ca"
 *             name:
 *               type: string
 *               description: Service name
 *               example: "DNA Paternity Testing"
 *             price:
 *               type: number
 *               description: Service price
 *               example: 3000
 *             duration:
 *               type: number
 *               description: Service duration in minutes
 *               example: 60
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
 *             email:
 *               type: string
 *               description: Staff's email
 *               example: "jane.smith@example.com"
 *         slot_id:
 *           type: object
 *           description: Time slot information (if booked via slot)
 *           properties:
 *             _id:
 *               type: string
 *               description: Slot ID
 *               example: "60d0fe4f5311236168a109cb"
 *             start_time:
 *               type: string
 *               format: date-time
 *               description: Slot start time
 *               example: "2023-10-15T14:00:00Z"
 *             end_time:
 *               type: string
 *               format: date-time
 *               description: Slot end time
 *               example: "2023-10-15T15:00:00Z"
 *         appointment_date:
 *           type: string
 *           format: date-time
 *           description: Appointment date and time
 *           example: "2023-10-15T14:30:00Z"
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Type of sample collection
 *           example: "facility"
 *         collection_address:
 *           type: string
 *           description: Address for home collection
 *           example: "123 Main St, City, Country"
 *         status:
 *           type: string
 *           description: Current appointment status
 *           enum: [pending, confirmed, sample_collected, sample_received, testing, completed, cancelled]
 *           example: "pending"
 *         kit:
 *           type: object
 *           description: Kit information (if assigned)
 *           properties:
 *             _id:
 *               type: string
 *               description: Kit ID
 *               example: "60d0fe4f5311236168a109cd"
 *             code:
 *               type: string
 *               description: Kit code
 *               example: "KIT-20230915-001"
 *             status:
 *               type: string
 *               description: Kit status
 *               example: "assigned"
 *             assigned_to_user_id:
 *               type: object
 *               description: Laboratory technician information
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Laboratory technician ID
 *                   example: "60d0fe4f5311236168a109dd"
 *                 first_name:
 *                   type: string
 *                   description: Laboratory technician's first name
 *                   example: "Alex"
 *                 last_name:
 *                   type: string
 *                   description: Laboratory technician's last name
 *                   example: "Johnson"
 *                 role:
 *                   type: string
 *                   description: User role
 *                   example: "laboratory_technician"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *           example: "2023-10-01T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *           example: "2023-10-01T10:30:00Z"
 *
 *     AppointmentPaginationResponse:
 *       type: object
 *       properties:
 *         pageData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AppointmentResponse'
 *         pageInfo:
 *           type: object
 *           properties:
 *             totalItems:
 *               type: integer
 *               description: Total number of items
 *               example: 25
 *             totalPages:
 *               type: integer
 *               description: Total number of pages
 *               example: 3
 *             pageNum:
 *               type: integer
 *               description: Current page number
 *               example: 1
 *             pageSize:
 *               type: integer
 *               description: Number of items per page
 *               example: 10
 *     
 *     SearchAppointmentParams:
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
 *         status:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, sample_received, testing, completed, cancelled]
 *           description: Filter by appointment status
 *           example: "confirmed"
 *         customer_id:
 *           type: string
 *           description: Filter appointments by customer ID
 *           example: "60d0fe4f5311236168a109cf"
 *         service_id:
 *           type: string
 *           description: Filter appointments by service ID
 *           example: "60d0fe4f5311236168a109ca"
 *         staff_id:
 *           type: string
 *           description: Filter appointments by staff ID
 *           example: "60d0fe4f5311236168a109cc"
 *         date_from:
 *           type: string
 *           format: date
 *           description: Filter appointments from this date
 *           example: "2023-10-01"
 *         date_to:
 *           type: string
 *           format: date
 *           description: Filter appointments until this date
 *           example: "2023-10-31"
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Filter by appointment type
 *           example: "facility"
 *
 *     AppointmentStatusUpdateResponse:
 *       type: object
 *       properties:
 *         appointment:
 *           $ref: '#/components/schemas/AppointmentResponse'
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Appointment status updated successfully"
 *         success:
 *           type: boolean
 *           description: Operation success status
 *           example: true
 *
 *     FeedbackRequestDto:
 *       type: object
 *       required:
 *         - appointment_id
 *         - rating
 *       properties:
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment being rated
 *           example: "60d0fe4f5311236168a109ce"
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating (1-5 stars)
 *           example: 5
 *         comment:
 *           type: string
 *           description: Optional feedback comment
 *           example: "Great service and professional staff!"
 */
