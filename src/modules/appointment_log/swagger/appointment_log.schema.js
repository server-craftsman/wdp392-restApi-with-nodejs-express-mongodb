/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Log entry ID
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment
 *         customer_id:
 *           type: string
 *           description: ID of the customer
 *         staff_id:
 *           type: string
 *           description: ID of the staff member
 *         laboratory_technician_id:
 *           type: string
 *           description: ID of the laboratory technician
 *         administrative_case_id:
 *           type: string
 *           description: ID of the administrative case (for legal appointments)
 *         agency_contact_email:
 *           type: string
 *           description: Email of the requesting agency (for administrative appointments)
 *         old_status:
 *           type: string
 *           enum: [pending, confirmed, sample_assigned, sample_collected, sample_received, testing, completed, cancelled, sample_created, awaiting_authorization, authorized, ready_for_collection]
 *           description: Previous appointment status
 *         new_status:
 *           type: string
 *           enum: [pending, confirmed, sample_assigned, sample_collected, sample_received, testing, completed, cancelled, sample_created, awaiting_authorization, authorized, ready_for_collection]
 *           description: New appointment status
 *         action:
 *           type: string
 *           enum: [create, update_status, assign_staff, assign_lab_tech, checkin, add_note, confirm, cancel, authorize, progress_update, agency_notification]
 *           description: Action that triggered this log entry
 *         type:
 *           type: string
 *           enum: [self, facility, home, administrative]
 *           description: Type of appointment
 *         notes:
 *           type: string
 *           description: Additional notes or comments
 *         metadata:
 *           type: object
 *           description: Additional metadata about the action
 *           properties:
 *             assigned_staff_ids:
 *               type: array
 *               items:
 *                 type: string
 *               description: IDs of assigned staff members
 *             unassigned_staff_ids:
 *               type: array
 *               items:
 *                 type: string
 *               description: IDs of unassigned staff members
 *             assigned_lab_tech_id:
 *               type: string
 *               description: ID of assigned laboratory technician
 *             checkin_location:
 *               type: string
 *               description: Location where check-in occurred
 *             checkin_note:
 *               type: string
 *               description: Note added during check-in
 *             case_status_update:
 *               type: string
 *               description: Administrative case status update
 *             agency_notified:
 *               type: boolean
 *               description: Whether agency was notified
 *             authorization_code:
 *               type: string
 *               description: Authorization code for legal appointments
 *             is_administrative:
 *               type: boolean
 *               description: Whether this is an administrative appointment
 *             government_funded:
 *               type: boolean
 *               description: Whether this is government funded
 *             user_agent:
 *               type: string
 *               description: User agent of the person performing the action
 *             ip_address:
 *               type: string
 *               description: IP address of the person performing the action
 *             additional_data:
 *               type: object
 *               description: Any additional data
 *         action_timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the action occurred
 *         performed_by_user_id:
 *           type: string
 *           description: ID of the user who performed the action
 *         performed_by_role:
 *           type: string
 *           description: Role of the user who performed the action
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Log creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Log update timestamp
 *       example:
 *         _id: "60d0fe4f5311236168a109ce"
 *         appointment_id: "60d0fe4f5311236168a109ca"
 *         customer_id: "60d0fe4f5311236168a109cb"
 *         staff_id: "60d0fe4f5311236168a109cc"
 *         old_status: "pending"
 *         new_status: "confirmed"
 *         action: "update_status"
 *         type: "facility"
 *         notes: "Appointment confirmed by staff"
 *         action_timestamp: "2024-01-15T10:00:00.000Z"
 *         performed_by_user_id: "60d0fe4f5311236168a109cd"
 *         performed_by_role: "STAFF"

 *     AppointmentLogListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Appointment logs retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             pageData:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AppointmentLog'
 *             pageInfo:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   example: 25
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 pageNum:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 10

 *     AppointmentTimelineResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Appointment timeline retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AppointmentLog'

 *     LogStatisticsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Log statistics retrieved successfully"
 *         data:
 *           type: object
 *           properties:
 *             totalLogs:
 *               type: integer
 *               example: 150
 *             logsByAction:
 *               type: object
 *               example:
 *                 create: 25
 *                 update_status: 50
 *                 assign_staff: 30
 *                 checkin: 20
 *                 progress_update: 15
 *                 agency_notification: 10
 *             logsByStatus:
 *               type: object
 *               example:
 *                 pending: 10
 *                 confirmed: 25
 *                 sample_collected: 30
 *                 testing: 20
 *                 completed: 65
 *             adminAppointments:
 *               type: integer
 *               example: 15
 */
