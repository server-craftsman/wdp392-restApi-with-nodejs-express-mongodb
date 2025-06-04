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
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *         service_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *         status:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, sample_received, testing, completed, cancelled]
 *         appointment_date:
 *           type: string
 *           format: date-time
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *         collection_address:
 *           type: string
 *         staff_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *         slot_id:
 *           type: object
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
 *         appointment_date:
 *           type: string
 *           format: date-time
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
 *         data:
 *           $ref: '#/components/schemas/Appointment'
 *         message:
 *           type: string
 *     // ... các schema khác như SampleResponse, ErrorResponse, v.v.
 */
