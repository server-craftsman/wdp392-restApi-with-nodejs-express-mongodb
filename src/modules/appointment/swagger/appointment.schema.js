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
 *           enum: [self, facility, home, administrative]
 *           description: Type of appointment collection
 *         collection_address:
 *           type: string
 *           description: Address for home collection (required for home type)
 *         status:
 *           type: string
 *           enum: [pending, confirmed, sample_assigned, sample_collected, sample_received, testing, completed, cancelled, awaiting_authorization, authorized, ready_for_collection]
 *           description: Current status of the appointment
 *         payment_status:
 *           type: string
 *           enum: [unpaid, paid, refunded, failed, government_funded]
 *           description: Payment status
 *         payment_stage:
 *           type: string
 *           enum: [unpaid, deposit_paid, paid, government_paid]
 *           description: Payment stage
 *         total_amount:
 *           type: number
 *           description: Total amount for the service
 *         deposit_amount:
 *           type: number
 *           description: Deposit amount (30% of total)
 *         amount_paid:
 *           type: number
 *           description: Amount already paid
 *         administrative_case_id:
 *           type: string
 *           description: ID of the administrative case (for legal appointments)
 *         agency_contact_email:
 *           type: string
 *           description: Email of the requesting agency (for administrative appointments)
 *         checkin_logs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CheckinLog'
 *           description: Check-in logs for the appointment
 *         notes:
 *           type: array
 *           items:
 *             type: string
 *           description: Notes added to the appointment
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         _id: "60d0fe4f5311236168a109ce"
 *         user_id: "60d0fe4f5311236168a109ca"
 *         service_id: "60d0fe4f5311236168a109cb"
 *         appointment_date: "2024-01-15T10:00:00.000Z"
 *         type: "facility"
 *         status: "pending"
 *         payment_status: "unpaid"
 *         total_amount: 2000000
 *         deposit_amount: 600000
 *         amount_paid: 0

 *     CheckinLog:
 *       type: object
 *       properties:
 *         staff_id:
 *           type: string
 *           description: ID of the staff who checked in
 *         time:
 *           type: string
 *           format: date-time
 *           description: Check-in timestamp
 *         note:
 *           type: string
 *           description: Optional note for the check-in
 *       example:
 *         staff_id: "60d0fe4f5311236168a109cd"
 *         time: "2024-01-15T10:00:00.000Z"
 *         note: "Customer arrived on time"

 *     CreateAdministrativeAppointmentRequest:
 *       type: object
 *       required:
 *         - service_id
 *         - user_id
 *       properties:
 *         service_id:
 *           type: string
 *           description: ID of the DNA testing service
 *           example: "60d0fe4f5311236168a109cb"
 *         user_id:
 *           type: string
 *           description: ID of the user/customer for whom the appointment is being created
 *           example: "68810ddb8c84f0da10721596"
 *         collection_address:
 *           type: string
 *           description: Address for sample collection (optional, defaults to facility)
 *           example: "123 Main St, Ho Chi Minh City"
 *         staff_id:
 *           type: string
 *           description: Optional staff ID to assign directly
 *           example: "60d0fe4f5311236168a109cd"
 *         laboratory_technician_id:
 *           type: string
 *           description: Optional lab technician ID to assign
 *           example: "60d0fe4f5311236168a109ce"  

 *     AdministrativeAppointmentResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Appointment'
 *         - type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [administrative]
 *               description: Always 'administrative' for legal appointments
 *             payment_status:
 *               type: string
 *               enum: [government_funded]
 *               description: Always 'government_funded' for administrative appointments
 *             payment_stage:
 *               type: string
 *               enum: [government_paid]
 *               description: Always 'government_paid' for administrative appointments
 *             total_amount:
 *               type: number
 *               enum: [0]
 *               description: Always 0 for government-funded appointments
 *             administrative_case_id:
 *               type: string
 *               description: ID of the associated administrative case
 *             agency_contact_email:
 *               type: string
 *               description: Email of the requesting agency

 *     AppointmentValidationResponse:
 *       type: object
 *       properties:
 *         canCreate:
 *           type: boolean
 *           description: Whether appointment can be created for the case
 *         reason:
 *           type: string
 *           description: Reason why appointment cannot be created (if canCreate is false)
 *       example:
 *         canCreate: true

 *     UpdateAppointmentProgressRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [sample_collected, testing, completed]
 *           description: New appointment status to update
 *           example: "sample_collected"

 *     AppointmentProgressResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Appointment progress updated successfully"
 *         data:
 *           type: object
 *           nullable: true

 *     CreateAppointmentRequest:
 *       type: object
 *       required:
 *         - service_id
 *         - type
 *       properties:
 *         service_id:
 *           type: string
 *           description: ID of the service to book
 *           example: "60d0fe4f5311236168a109cb"
 *         slot_id:
 *           type: string
 *           description: ID of the time slot (optional)
 *           example: "60d0fe4f5311236168a109cc"
 *         appointment_date:
 *           type: string
 *           format: date-time
 *           description: Appointment date (auto-filled if slot_id provided)
 *           example: "2024-01-15T10:00:00.000Z"
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Type of collection
 *           example: "facility"
 *         collection_address:
 *           type: string
 *           description: Address for home collection (required if type is home)
 *           example: "123 Main St, Ho Chi Minh City"
 *         case_number:
 *           type: string
 *           description: Case number (required for administrative services)
 *           example: "CASE-2024-123456"
 *         authorization_code:
 *           type: string
 *           description: Authorization code (required for administrative services)
 *           example: "AUTH-2024-789"
 *         agency_contact_email:
 *           type: string
 *           description: Agency contact email (for administrative services)
 *           example: "agency@court.gov.vn"

 *     CheckinRequest:
 *       type: object
 *       properties:
 *         note:
 *           type: string
 *           description: Optional note for the check-in
 *           example: "Customer arrived on time"

 *     AddNoteRequest:
 *       type: object
 *       required:
 *         - note
 *       properties:
 *         note:
 *           type: string
 *           description: Note to add to the appointment
 *           example: "Customer requested additional information"
 */
