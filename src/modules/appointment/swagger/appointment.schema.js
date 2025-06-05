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
 */
