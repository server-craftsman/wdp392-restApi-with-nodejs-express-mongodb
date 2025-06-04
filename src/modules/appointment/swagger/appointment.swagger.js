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
 *     description: Assign a staff member to an existing appointment
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
 *             $ref: '#/components/schemas/AssignStaffDto'
 *     responses:
 *       200:
 *         description: Staff assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Invalid input data or appointment ID format
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
 *     summary: Confirm appointment and assign kit to laboratory technician (Staff only)
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
 *             $ref: '#/components/schemas/ConfirmAppointmentDto'
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