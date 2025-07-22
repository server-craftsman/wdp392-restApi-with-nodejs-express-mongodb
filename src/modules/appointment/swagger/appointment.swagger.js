/**
 * @swagger
 * tags:
 *   name: appointments
 *   description: Appointment management APIs
 */

/**
 * @swagger
 * /api/appointment/create:
 *   post:
 *     tags:
 *       - appointments
 *     summary: Create a new appointment (Customer only)
 *     description: Book a new appointment for a DNA testing service
 *     operationId: createAppointment
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentDto'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Invalid input data or missing required fields
 *       401:
 *         description: Unauthorized - Customer authentication required
 *       404:
 *         description: Service or slot not found
 *       409:
 *         description: Slot already booked or unavailable
 */

/**
 * @swagger
 * /api/appointment/search:
 *   get:
 *     tags: [appointments]
 *     summary: Search appointments
 *     description: Search and filter appointments with pagination
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user ID (MongoDB ObjectId)
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: string
 *         description: Filter by staff ID (MongoDB ObjectId)
 *       - in: query
 *         name: service_id
 *         schema:
 *           type: string
 *         description: Filter by service ID (MongoDB ObjectId)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, sample_received, testing, completed, cancelled]
 *         description: Filter by appointment status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [self, facility, home]
 *         description: Filter by appointment type
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments from this date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments until this date (YYYY-MM-DD)
 *       - in: query
 *         name: search_term
 *         schema:
 *           type: string
 *         description: Search term for customer name or address
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/{id}:
 *   get:
 *     tags:
 *       - appointments
 *     summary: Get appointment by ID (All authenticated users)
 *     description: Retrieve detailed information about a specific appointment
 *     operationId: getAppointmentById
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "60d0fe4f5311236168a109ce"
 *     responses:
 *       200:
 *         description: Appointment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Invalid appointment ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - User cannot access this appointment
 *       404:
 *         description: Appointment not found
 */

/**
 * @swagger
 * /api/appointment/{id}/assign-staff:
 *   put:
 *     tags:
 *       - appointments
 *     summary: Assign staff to appointment (Manager only)
 *     description: Assign a staff member to an existing appointment. The system checks if the staff is assigned to the slot and if they haven't reached their appointment limit for that slot.
 *     operationId: assignStaffToAppointment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "60d0fe4f5311236168a109ce"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staff_id
 *             properties:
 *               staff_id:
 *                 type: string
 *                 description: ID of the staff member to assign
 *                 example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Staff assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Invalid input data, appointment ID format, or staff has reached appointment limit for this slot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Staff has reached appointment limit for this slot. Consider assigning to John Doe (ID: 60d0fe4f5311236168a109cb)"
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Manager access required
 *       404:
 *         description: Appointment or staff not found
 *       422:
 *         description: Invalid operation - Appointment status must be 'pending'
 */

/**
 * @swagger
 * /api/appointment/{id}/confirm:
 *   put:
 *     tags:
 *       - appointments
 *     summary: Confirm appointment (Staff only)
 *     description: Confirm an appointment, assign a testing kit to a laboratory technician, and update appointment status to 'confirmed'
 *     operationId: confirmAppointment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "60d0fe4f5311236168a109ce"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slot_id
 *             properties:
 *               slot_id:
 *                 type: string
 *                 description: ID of the time slot for the appointment
 *                 example: "60d0fe4f5311236168a109cd"
 *     responses:
 *       200:
 *         description: Appointment confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Invalid input data, appointment ID format, or laboratory technician role
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Staff access required or staff not assigned to this appointment
 *       404:
 *         description: Appointment, kit, or laboratory technician not found
 *       409:
 *         description: Kit already assigned to another appointment
 *       422:
 *         description: Invalid operation - Appointment status must be 'pending' with assigned staff
 */

/**
 * @swagger
 * /api/appointment/{id}/samples:
 *   get:
 *     tags:
 *       - appointments
 *     summary: Get samples for an appointment
 *     description: Retrieve all samples associated with a specific appointment
 *     operationId: getAppointmentSamples
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "60d0fe4f5311236168a109ce"
 *     responses:
 *       200:
 *         description: Samples retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SampleResponse'
 *       400:
 *         description: Invalid appointment ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/{appointmentId}/price:
 *   get:
 *     tags:
 *       - appointments
 *     summary: Get price for an appointment
 *     description: Retrieves the price for an appointment based on its associated service
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: appointmentId
 *         in: path
 *         required: true
 *         description: ID of the appointment
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Appointment price retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     price:
 *                       type: number
 *                       example: 100000
 *                 message:
 *                   type: string
 *                   example: "Appointment price retrieved successfully"
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/appointment/staff/assigned:
 *   get:
 *     tags: [appointments]
 *     summary: Get appointments assigned to staff member (Staff only)
 *     description: Retrieve paginated list of appointments assigned to the authenticated staff member with filtering options
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
 *         example: 20
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by customer ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109ce"
 *       - in: query
 *         name: service_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by service ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109cf"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, sample_assigned, sample_collected, sample_received, testing, completed, cancelled]
 *         description: Filter by appointment status
 *         example: "confirmed"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [self, facility, home]
 *         description: Filter by appointment type
 *         example: "home"
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments from this date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments until this date (YYYY-MM-DD)
 *         example: "2024-12-31"
 *       - in: query
 *         name: search_term
 *         schema:
 *           type: string
 *         description: Search term for customer name or collection address
 *         example: "John Smith"
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [unpaid, paid, refunded, failed]
 *         description: Filter by payment status
 *         example: "paid"
 *       - in: query
 *         name: slot_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by slot ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109d0"
 *       - in: query
 *         name: laboratory_technician_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by assigned laboratory technician ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109d1"
 *     responses:
 *       200:
 *         description: List of assigned appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentListResponse'
 *             examples:
 *               success:
 *                 summary: Successful response with appointments
 *                 value:
 *                   success: true
 *                   message: "Appointments retrieved successfully"
 *                   data:
 *                     pageData:
 *                       - _id: "60d0fe4f5311236168a109ce"
 *                         user_id:
 *                           _id: "60d0fe4f5311236168a109ca"
 *                           first_name: "John"
 *                           last_name: "Doe"
 *                           email: "john.doe@example.com"
 *                         service_id:
 *                           _id: "60d0fe4f5311236168a109cb"
 *                           name: "Paternity Test"
 *                         appointment_date: "2024-01-15T10:00:00Z"
 *                         status: "confirmed"
 *                         type: "home"
 *                         collection_address: "123 Main St, City"
 *                         payment_status: "paid"
 *                     pageInfo:
 *                       totalItems: 50
 *                       totalPages: 5
 *                       pageNum: 1
 *                       pageSize: 10
 *       401:
 *         description: Unauthorized - Staff authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Staff access required
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
 * /api/appointment/lab-tech/assigned:
 *   get:
 *     tags: [appointments]
 *     summary: Get appointments assigned to laboratory technician (Lab technician only)
 *     description: Retrieve paginated list of appointments assigned to the authenticated laboratory technician with filtering options
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
 *         example: 15
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by customer ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109ce"
 *       - in: query
 *         name: service_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by service ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109cf"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, sample_assigned, sample_collected, sample_received, testing, completed, cancelled]
 *         description: Filter by appointment status
 *         example: "sample_received"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [self, facility, home]
 *         description: Filter by appointment type
 *         example: "facility"
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments from this date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments until this date (YYYY-MM-DD)
 *         example: "2024-12-31"
 *       - in: query
 *         name: search_term
 *         schema:
 *           type: string
 *         description: Search term for customer name or collection address
 *         example: "Jane"
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [unpaid, paid, refunded, failed]
 *         description: Filter by payment status
 *         example: "paid"
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by assigned staff ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109d2"
 *       - in: query
 *         name: slot_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by slot ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109d0"
 *       - in: query
 *         name: administrative_case_id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by administrative case ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109d3"
 *     responses:
 *       200:
 *         description: List of assigned appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentListResponse'
 *             examples:
 *               success:
 *                 summary: Successful response with lab tech assignments
 *                 value:
 *                   success: true
 *                   message: "Appointments retrieved successfully"
 *                   data:
 *                     pageData:
 *                       - _id: "60d0fe4f5311236168a109ce"
 *                         user_id:
 *                           _id: "60d0fe4f5311236168a109ca"
 *                           first_name: "Jane"
 *                           last_name: "Smith"
 *                           email: "jane.smith@example.com"
 *                         service_id:
 *                           _id: "60d0fe4f5311236168a109cb"
 *                           name: "DNA Analysis"
 *                         staff_id:
 *                           _id: "60d0fe4f5311236168a109d2"
 *                           first_name: "Staff"
 *                           last_name: "Member"
 *                         appointment_date: "2024-01-20T14:30:00Z"
 *                         status: "testing"
 *                         type: "facility"
 *                         payment_status: "paid"
 *                     pageInfo:
 *                       totalItems: 25
 *                       totalPages: 3
 *                       pageNum: 1
 *                       pageSize: 10
 *       401:
 *         description: Unauthorized - Laboratory technician authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Laboratory technician access required
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
 * /api/appointment/{id}/assign-lab-tech:
 *   post:
 *     tags: [appointments]
 *     summary: Assign a laboratory technician to an appointment (Staff only)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignLabTechRequest'
 *     responses:
 *       200:
 *         description: Laboratory technician assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment or laboratory technician not found
 */

/**
 * @swagger
 * /api/appointment/staff/available:
 *   get:
 *     tags: [appointments]
 *     summary: Get available staff (Manager only)
 *     description: Retrieve list of staff members with their roles and departments
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Staff roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Staff user ID
 *                       first_name:
 *                         type: string
 *                         description: Staff first name
 *                       last_name:
 *                         type: string
 *                         description: Staff last name
 *                       email:
 *                         type: string
 *                         description: Staff email
 *                       phone_number:
 *                         type: string
 *                         description: Staff phone number
 *                       staff_profile:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             enum: [ACTIVE, INACTIVE]
 *                             description: Staff profile status
 *                           department:
 *                             type: string
 *                             description: Department ID
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Manager access required
 *       500:
 *         description: Internal server error
 *
 * /api/appointment/staff/slots:
 *   get:
 *     tags: [appointments]
 *     summary: Get available slots for logged-in staff (Staff only)
 *     description: Retrieve all available time slots assigned to the logged-in staff member
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Slot ID
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: Date of the slot
 *                       time_slots:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             start_time:
 *                               type: object
 *                               properties:
 *                                 hour:
 *                                   type: integer
 *                                 minute:
 *                                   type: integer
 *                             end_time:
 *                               type: object
 *                               properties:
 *                                 hour:
 *                                   type: integer
 *                                 minute:
 *                                   type: integer
 *                       status:
 *                         type: string
 *                         enum: [AVAILABLE, BOOKED]
 *                         description: Slot status
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Staff access required
 *       404:
 *         description: Staff profile not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/lab-tech/available:
 *   get:
 *     tags: [appointments]
 *     summary: Get available laboratory technicians (Staff only)
 *     description: Retrieve list of available laboratory technicians that can be assigned to appointments
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Available laboratory technicians retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Laboratory technician user ID
 *                       first_name:
 *                         type: string
 *                         description: Laboratory technician first name
 *                       last_name:
 *                         type: string
 *                         description: Laboratory technician last name
 *                       email:
 *                         type: string
 *                         description: Laboratory technician email
 *                       phone_number:
 *                         type: string
 *                         description: Laboratory technician phone number
 *                       staff_profile:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             enum: [ACTIVE, INACTIVE]
 *                             description: Staff profile status
 *                           department:
 *                             type: string
 *                             description: Department ID
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Staff access required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/staff/available-for-slot/{slotId}:
 *   get:
 *     tags: [appointments]
 *     summary: Get available staff for a specific slot (Manager only)
 *     description: Retrieve list of staff members assigned to a slot who haven't reached their appointment limit
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *         description: Slot ID
 *         example: "60d0fe4f5311236168a109ce"
 *     responses:
 *       200:
 *         description: Available staff for slot retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Staff user ID
 *                       first_name:
 *                         type: string
 *                         description: Staff first name
 *                       last_name:
 *                         type: string
 *                         description: Staff last name
 *                       email:
 *                         type: string
 *                         description: Staff email
 *                       appointment_count:
 *                         type: integer
 *                         description: Current number of appointments assigned to this staff in this slot
 *                         example: 2
 *                       appointment_limit:
 *                         type: integer
 *                         description: Maximum number of appointments this staff can handle in this slot
 *                         example: 3
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Manager access required
 *       404:
 *         description: Slot not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/{id}/unassign-staff:
 *   put:
 *     tags:
 *       - appointments
 *     summary: Unassign staff from appointment (Manager/Admin only)
 *     description: Remove the assigned staff from an appointment and update the slot's assigned_count
 *     operationId: unassignStaffFromAppointment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "60d0fe4f5311236168a109ce"
 *     responses:
 *       200:
 *         description: Staff unassigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AppointmentResponse'
 *                 message:
 *                   type: string
 *                   example: "Staff unassigned successfully"
 *       400:
 *         description: Invalid appointment ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Manager/Admin access required
 *       404:
 *         description: Appointment not found
 */

// Import consultation schemas and endpoints
const fs = require('fs');
const path = require('path');

// Include consultation schemas
require('./consultation.schema.js');

// Include consultation endpoints  
require('./consultation.swagger.js');