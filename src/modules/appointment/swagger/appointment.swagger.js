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
 *     tags:
 *       - appointments
 *     summary: Search appointments (All authenticated users)
 *     description: Search for appointments with pagination and filtering options
 *     operationId: searchAppointments
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, sample_received, testing, completed, cancelled]
 *         description: Filter by appointment status
 *         example: "confirmed"
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *         description: Filter appointments by customer ID
 *         example: "60d0fe4f5311236168a109cf"
 *       - in: query
 *         name: service_id
 *         schema:
 *           type: string
 *         description: Filter appointments by service ID
 *         example: "60d0fe4f5311236168a109ca"
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: string
 *         description: Filter appointments by staff ID
 *         example: "60d0fe4f5311236168a109cc"
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments from this date
 *         example: "2023-10-01"
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments until this date
 *         example: "2023-10-31"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [self, facility, home]
 *         description: Filter by appointment type
 *         example: "facility"
 *     responses:
 *       200:
 *         description: List of appointments with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentPaginationResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
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