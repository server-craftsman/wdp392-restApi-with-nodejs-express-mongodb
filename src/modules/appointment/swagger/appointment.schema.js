/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Appointment ID
 *         user_id:
 *           type: string
 *           description: ID of the user who made the appointment
 *         service_id:
 *           type: string
 *           description: ID of the service
 *         slot_id:
 *           type: string
 *           description: ID of the selected time slot
 *         staff_id:
 *           type: string
 *           description: ID of the assigned staff member
 *         laboratory_technician_id:
 *           type: string
 *           description: ID of the assigned laboratory technician
 *         appointment_date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the appointment
 *         type:
 *           type: string
 *           enum: [FACILITY, HOME]
 *           description: Type of appointment
 *         collection_address:
 *           type: string
 *           description: Address for home collection
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED]
 *           description: Current status of the appointment
 *         payment_status:
 *           type: string
 *           enum: [UNPAID, PAID, REFUNDED]
 *           description: Payment status of the appointment
 *         administrative_case_id:
 *           type: string
 *           description: ID of the administrative case associated with the appointment
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateAppointmentDto:
 *       type: object
 *       required:
 *         - service_id
 *         - type
 *       properties:
 *         service_id:
 *           type: string
 *         slot_id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *         collection_address:
 *           type: string
 *         case_number:
 *           type: string
 *         authorization_code:
 *           type: string
 *     AppointmentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Appointment'
 *     AppointmentListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             pageData:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 *             pageInfo:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 pageNum:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *     AssignLabTechRequest:
 *       type: object
 *       required:
 *         - lab_tech_id
 *       properties:
 *         lab_tech_id:
 *           type: string
 *           description: ID of the laboratory technician to assign
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Invalid request parameters"
 *         error:
 *           type: string
 *           description: Technical error details (optional)
 *           example: "ValidationError: Invalid ObjectId format"
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *           example: 400
 *     AppointmentFilterParams:
 *       type: object
 *       properties:
 *         pageNum:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *           description: Page number for pagination
 *         pageSize:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *           description: Number of items per page
 *         user_id:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: Filter by customer ID (MongoDB ObjectId)
 *         service_id:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: Filter by service ID (MongoDB ObjectId)
 *         status:
 *           type: string
 *           enum: [pending, confirmed, sample_assigned, sample_collected, sample_received, testing, completed, cancelled]
 *           description: Filter by appointment status
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Filter by appointment type
 *         start_date:
 *           type: string
 *           format: date
 *           description: Filter appointments from this date (YYYY-MM-DD)
 *         end_date:
 *           type: string
 *           format: date
 *           description: Filter appointments until this date (YYYY-MM-DD)
 *         search_term:
 *           type: string
 *           description: Search term for customer name or collection address
 *         payment_status:
 *           type: string
 *           enum: [unpaid, paid, refunded, failed]
 *           description: Filter by payment status
 *         staff_id:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: Filter by assigned staff ID (MongoDB ObjectId)
 *         laboratory_technician_id:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: Filter by assigned laboratory technician ID (MongoDB ObjectId)
 *         slot_id:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: Filter by slot ID (MongoDB ObjectId)
 *         administrative_case_id:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: Filter by administrative case ID (MongoDB ObjectId)
 *     SlotWithAppointmentLimit:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Slot ID
 *         staff_profile_ids:
 *           type: array
 *           description: List of staff profile IDs assigned to this slot
 *           items:
 *             type: string
 *         appointment_limit:
 *           type: integer
 *           description: Maximum number of appointments a staff member can handle in this slot
 *           example: 3
 *         assigned_count:
 *           type: integer
 *           description: Current number of appointments assigned to this slot
 *           example: 1
 *         time_slots:
 *           type: array
 *           description: Time slots details
 *           items:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               day:
 *                 type: integer
 *               start_time:
 *                 type: object
 *                 properties:
 *                   hour:
 *                     type: integer
 *                   minute:
 *                     type: integer
 *               end_time:
 *                 type: object
 *                 properties:
 *                   hour:
 *                     type: integer
 *                   minute:
 *                     type: integer
 *         status:
 *           type: string
 *           enum: [AVAILABLE, BOOKED, UNAVAILABLE]
 *           description: Current status of the slot
 *     AddressFilter:
 *       type: object
 *       description: 'Note: AddressFilter is for documentation only, not for direct use as a query parameter.'
 *       properties:
 *         street:
 *           type: string
 *         ward:
 *           type: string
 *         district:
 *           type: string
 *         city:
 *           type: string
 *         country:
 *           type: string
 *     StaffWithProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Staff ID
 *         first_name:
 *           type: string
 *           description: First name of the staff member
 *         last_name:
 *           type: string
 *           description: Last name of the staff member
 *         email:
 *           type: string
 *           description: Email address of the staff member
 *         phone_number:
 *           type: string
 *           description: Phone number of the staff member
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               description: Street address
 *             ward:
 *               type: string
 *               description: Ward/District
 *             district:
 *               type: string
 *               description: District
 *             city:
 *               type: string
 *               description: City
 *             country:
 *               type: string
 *               description: Country
 *         staff_profile:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [ACTIVE, INACTIVE]
 *               description: Current status of the staff profile
 *             department:
 *               type: string
 *               description: Department the staff member belongs to
 *     StaffListPaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             pageData:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StaffWithProfile'
 *             pageInfo:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 pageNum:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
