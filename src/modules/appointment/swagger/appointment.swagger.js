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
 *     description: |
 *       Book a new appointment for a DNA testing service with deposit payment flow.
 *       
 *       **Payment Flow:**
 *       - Appointment is created with total_amount, deposit_amount (30%), and payment_stage = 'unpaid'
 *       - Customer must pay deposit first to proceed with sample collection
 *       - After deposit payment, customer pays remaining amount for full service completion
 *       
 *       **Financial Fields Added:**
 *       - total_amount: Full service price
 *       - deposit_amount: 30% of total_amount 
 *       - amount_paid: Amount paid so far (starts at 0)
 *       - payment_stage: 'unpaid' | 'deposit_paid' | 'paid'
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
 *         description: Appointment created successfully with payment information
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
 *                     _id:
 *                       type: string
 *                       example: "64a1b2c3d4e5f6789abcdef0"
 *                     user_id:
 *                       type: string
 *                       example: "64a1b2c3d4e5f6789abcdef1"
 *                     service_id:
 *                       type: string
 *                       example: "64a1b2c3d4e5f6789abcdef2"
 *                     appointment_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:00:00.000Z"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     payment_status:
 *                       type: string
 *                       example: "unpaid"
 *                     total_amount:
 *                       type: number
 *                       example: 500000
 *                       description: "Total service cost (VND)"
 *                     deposit_amount:
 *                       type: number
 *                       example: 150000
 *                       description: "Required deposit amount (30% of total)"
 *                     amount_paid:
 *                       type: number
 *                       example: 0
 *                       description: "Amount paid so far"
 *                     payment_stage:
 *                       type: string
 *                       example: "unpaid"
 *                       enum: [unpaid, deposit_paid, paid]
 *                       description: "Current payment stage"
 *                 message:
 *                   type: string
 *                   example: "Appointment created successfully. Please pay deposit to proceed."
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
 *               - staff_ids
 *             properties:
 *               staff_ids:
 *                 type: array
 *                 description: IDs of the staff members to assign
 *                 example: ["60d0fe4f5311236168a109ca", "60d0fe4f5311236168a109cb"]
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
 *     description: Retrieve paginated list of staff members with their roles and departments. Supports filtering by address fields and pagination.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: 'Address filter as JSON string. Example: {"city":"HCM","district":"District 1"}'
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
 *     responses:
 *       200:
 *         description: Staff roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffListPaginatedResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Manager access required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
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
 *     summary: Unassign staff from an appointment
 *     description: Remove the assigned staff from an appointment. This will also update the slot availability.
 *     operationId: unassignStaff
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
 *                 message:
 *                   type: string
 *                   example: "Staff unassigned successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/administrative/{caseId}:
 *   post:
 *     tags:
 *       - administrative-appointments
 *     summary: Create administrative appointment for legal case
 *     description: |
 *       Create a DNA testing appointment for an approved administrative/legal case.
 *       This endpoint is used by staff to schedule appointments for government/court-ordered DNA tests.
 *       The appointment will be automatically set as government-funded with no cost to the agency.
 *     operationId: createAdministrativeAppointment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Administrative case ID
 *         example: "60d0fe4f5311236168a109ce"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdministrativeAppointmentRequest'
 *           example:
 *             service_id: "6880ff47cda9a9e0a4c528e1"
 *             user_id: "68810ddb8c84f0da10721596"
 *             collection_address: "123 Main St, Ho Chi Minh City"
 *             staff_id: "60d0fe4f5311236168a109cd"
 *             laboratory_technician_id: "68810d92071ec5fbf580ec89"
 *     responses:
 *       201:
 *         description: Administrative appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Administrative appointment created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AdministrativeAppointmentResponse'
 *       400:
 *         description: |
 *           Bad request - Validation failed or case not approved:
 *           - Missing required fields (service_id, user_id)
 *           - Invalid appointment_date format (must be ISO 8601 date string)
 *           - Case must be approved before scheduling appointment
 *           - Invalid service_id or user_id
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
 *                   example: "Validation failed: appointment_date must be a valid ISO 8601 date string"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Administrative case or service not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/administrative/{caseId}/appointments:
 *   get:
 *     tags:
 *       - administrative-appointments
 *     summary: Get all appointments for an administrative case
 *     description: |
 *       Retrieve all appointments associated with a specific administrative case.
 *       This includes both active and cancelled appointments for tracking purposes.
 *     operationId: getAppointmentsByCase
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Administrative case ID
 *         example: "60d0fe4f5311236168a109ce"
 *     responses:
 *       200:
 *         description: Case appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Case appointments retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdministrativeAppointmentResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/administrative/{caseId}/validate:
 *   get:
 *     tags:
 *       - administrative-appointments
 *     summary: Validate if appointment can be created for case
 *     description: |
 *       Check if a new appointment can be created for the specified administrative case.
 *       This validates that the case is in approved status and doesn't have conflicting appointments.
 *     operationId: validateAppointmentCreation
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Administrative case ID
 *         example: "60d0fe4f5311236168a109ce"
 *     responses:
 *       200:
 *         description: Validation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Validation completed"
 *                 data:
 *                   $ref: '#/components/schemas/AppointmentValidationResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/administrative/progress/{appointmentId}:
 *   put:
 *     tags:
 *       - administrative-appointments
 *     summary: Update appointment progress and case status
 *     description: |
 *       Update the progress of an administrative appointment and automatically sync
 *       the corresponding administrative case status. This endpoint is typically used
 *       by staff or lab technicians to report progress on sample collection and testing.
 *     operationId: updateAppointmentProgress
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Administrative appointment ID
 *         example: "60d0fe4f5311236168a109ce"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAppointmentProgressRequest'
 *           example:
 *             status: "sample_collected"
 *     responses:
 *       200:
 *         description: Appointment progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentProgressResponse'
 *       400:
 *         description: Bad request - Invalid status or appointment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/{id}/payment-status:
 *   get:
 *     tags:
 *       - appointments
 *     summary: Get payment status and next steps for appointment
 *     description: |
 *       Get detailed payment information for an appointment including:
 *       - Current payment stage (unpaid/deposit_paid/paid)
 *       - Amount paid vs total amount  
 *       - Next payment amount required
 *       - Available payment methods for next step
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "64a1b2c3d4e5f6789abcdef0"
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
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
 *                     appointment_id:
 *                       type: string
 *                       example: "64a1b2c3d4e5f6789abcdef0"
 *                     payment_stage:
 *                       type: string
 *                       example: "deposit_paid"
 *                       enum: [unpaid, deposit_paid, paid]
 *                     total_amount:
 *                       type: number
 *                       example: 500000
 *                     deposit_amount:
 *                       type: number
 *                       example: 150000
 *                     amount_paid:
 *                       type: number
 *                       example: 150000
 *                     remaining_amount:
 *                       type: number
 *                       example: 350000
 *                     next_payment_stage:
 *                       type: string
 *                       example: "remaining"
 *                       enum: [deposit, remaining, none]
 *                     next_payment_amount:
 *                       type: number
 *                       example: 350000
 *                     can_proceed:
 *                       type: boolean
 *                       example: true
 *                       description: "Whether appointment can proceed to next stage"
 *                 message:
 *                   type: string
 *                   example: "Deposit paid. Remaining payment required for service completion."
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/{id}/payment-history:
 *   get:
 *     tags:
 *       - appointments
 *     summary: Get payment history for appointment
 *     description: |
 *       Get complete payment history for an appointment including:
 *       - All payment transactions (deposit + remaining)
 *       - Payment status and dates
 *       - Payment methods used
 *       - PayOS transaction details
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "64a1b2c3d4e5f6789abcdef0"
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
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
 *                     appointment_id:
 *                       type: string
 *                       example: "64a1b2c3d4e5f6789abcdef0"
 *                     total_amount:
 *                       type: number
 *                       example: 500000
 *                     amount_paid:
 *                       type: number
 *                       example: 500000
 *                     payment_stage:
 *                       type: string
 *                       example: "paid"
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           payment_no:
 *                             type: string
 *                             example: "PAY-DEPOSIT-ABC123-101530"
 *                           payment_stage:
 *                             type: string
 *                             example: "deposit"
 *                             enum: [deposit, remaining]
 *                           amount:
 *                             type: number
 *                             example: 150000
 *                           payment_method:
 *                             type: string
 *                             example: "pay_os"
 *                           status:
 *                             type: string
 *                             example: "completed"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00.000Z"
 *                           payos_order_code:
 *                             type: number
 *                             example: 123456789
 *                           payos_payment_url:
 *                             type: string
 *                             example: "https://pay.payos.vn/web/payment/123456"
 *                 message:
 *                   type: string
 *                   example: "Payment history retrieved successfully"
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/appointment/{id}/checkin:
 *   put:
 *     tags:
 *       - appointments
 *     summary: Check-in to appointment location (Staff only)
 *     description: |
 *       Record a staff check-in at the appointment location. This is particularly useful for HOME appointments where staff need to confirm arrival.
 *       If customer is not available, staff can add a note explaining the situation.
 *     operationId: checkinAppointment
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckinRequest'
 *           examples:
 *             customer_not_home:
 *               summary: Customer not at home
 *               value:
 *                 note: "Customer not at home, will return at 3 PM"
 *             successful_arrival:
 *               summary: Successful arrival
 *               value:
 *                 note: "Arrived on time, customer ready for sample collection"
 *             no_note:
 *               summary: Simple check-in without note
 *               value: {}
 *     responses:
 *       200:
 *         description: Check-in recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *                 message:
 *                   type: string
 *                   example: "Check-in recorded successfully"
 *       400:
 *         description: Invalid appointment ID format
 *       401:
 *         description: Unauthorized - Staff authentication required
 *       403:
 *         description: Forbidden - Staff not assigned to this appointment
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 *
 * /api/appointment/{id}/add-note:
 *   put:
 *     tags:
 *       - appointments
 *     summary: Add note to appointment (Staff only)
 *     description: |
 *       Add a note to an appointment for record-keeping purposes. This can be used to document:
 *       - Customer communication
 *       - Special instructions
 *       - Issues encountered
 *       - Rescheduling reasons
 *     operationId: addAppointmentNote
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
 *             $ref: '#/components/schemas/AddNoteRequest'
 *           examples:
 *             rescheduling:
 *               summary: Rescheduling note
 *               value:
 *                 note: "Customer requested to reschedule to next week due to illness"
 *             special_instruction:
 *               summary: Special instruction
 *               value:
 *                 note: "Customer has mobility issues, bring wheelchair accessible kit"
 *             communication_log:
 *               summary: Communication log
 *               value:
 *                 note: "Called customer to confirm appointment time - confirmed for 2 PM"
 *     responses:
 *       200:
 *         description: Note added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *                 message:
 *                   type: string
 *                   example: "Note added successfully"
 *       400:
 *         description: Invalid appointment ID format or missing note
 *       401:
 *         description: Unauthorized - Staff authentication required
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Internal server error
 */

// Import consultation schemas and endpoints
const fs = require('fs');
const path = require('path');

// Include consultation schemas
require('./consultation.schema.js');

// Include consultation endpoints  
require('./consultation.swagger.js');