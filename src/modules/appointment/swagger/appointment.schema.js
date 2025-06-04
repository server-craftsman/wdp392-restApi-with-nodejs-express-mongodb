/**
 * @swagger
 * tags:
 *   name: appointments
 *   description: Appointment management endpoints
 * 
 * /api/appointment/create:
 *   post:
 *     tags: [appointments]
 *     summary: Create a new appointment
 *     description: Create a new appointment with the specified service and details
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
 *         description: Invalid request data
 *       404:
 *         description: Service or slot not found
 * 
 * /api/appointment/{id}:
 *   get:
 *     tags: [appointments]
 *     summary: Get appointment by ID
 *     description: Retrieve detailed information about a specific appointment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       404:
 *         description: Appointment not found
 * 
 * /api/appointment/{id}/assign-staff:
 *   put:
 *     tags: [appointments]
 *     summary: Assign staff to appointment
 *     description: Assign a staff member to an appointment (Department Manager only)
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
 *             $ref: '#/components/schemas/AssignStaffDto'
 *     responses:
 *       200:
 *         description: Staff assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Invalid request data
 *       403:
 *         description: Forbidden - Only department managers can assign staff
 *       404:
 *         description: Appointment or staff not found
 * 
 * /api/appointment/{id}/confirm:
 *   put:
 *     tags: [appointments]
 *     summary: Confirm appointment
 *     description: Confirm an appointment by selecting a time slot (Staff only)
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
 *             $ref: '#/components/schemas/ConfirmAppointmentDto'
 *     responses:
 *       200:
 *         description: Appointment confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Invalid request data
 *       403:
 *         description: Forbidden - Only assigned staff can confirm
 *       404:
 *         description: Appointment or slot not found
 * 
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
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, sample_received, testing, completed, cancelled]
 *         description: Filter by appointment status
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: service_id
 *         schema:
 *           type: string
 *         description: Filter by service ID
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: string
 *         description: Filter by staff ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter until date
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [self, facility, home]
 *         description: Filter by appointment type
 *       - in: query
 *         name: search_term
 *         schema:
 *           type: string
 *         description: Search term for customer name or address
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentPaginationResponse'
 * 
 * /api/appointment/{id}/status:
 *   put:
 *     tags: [appointments]
 *     summary: Update appointment status
 *     description: Update the status of an appointment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, sample_collected, sample_received, testing, completed, cancelled]
 *         description: New appointment status
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentStatusUpdateResponse'
 *       404:
 *         description: Appointment not found
 * 
 * /api/appointment/{id}/samples:
 *   get:
 *     tags: [appointments]
 *     summary: Get appointment samples
 *     description: Retrieve all samples associated with an appointment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Samples retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SampleResponse'
 *       404:
 *         description: Appointment not found
 * 
 * /api/appointment/{id}/price:
 *   get:
 *     tags: [appointments]
 *     summary: Get appointment price
 *     description: Get the price of the service associated with an appointment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Price retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 price:
 *                   type: number
 *                   description: Service price
 *                   example: 3000
 *       404:
 *         description: Appointment or service not found
 * 
 * /api/appointment/{id}/feedback:
 *   post:
 *     tags: [appointments]
 *     summary: Submit appointment feedback
 *     description: Submit feedback for a completed appointment
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
 *             $ref: '#/components/schemas/FeedbackRequestDto'
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback submitted successfully"
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Appointment not found
 * 
 * /api/appointment/staff/roles:
 *   get:
 *     tags: [appointments]
 *     summary: Get staff roles
 *     description: Get list of all staff members with their roles and profiles (Department Manager only)
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Staff roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Staff user ID
 *                     example: "60d0fe4f5311236168a109cc"
 *                   first_name:
 *                     type: string
 *                     description: Staff's first name
 *                     example: "John"
 *                   last_name:
 *                     type: string
 *                     description: Staff's last name
 *                     example: "Doe"
 *                   email:
 *                     type: string
 *                     description: Staff's email
 *                     example: "john.doe@example.com"
 *                   phone_number:
 *                     type: string
 *                     description: Staff's phone number
 *                     example: "+84912345678"
 *                   staff_profile:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         enum: [active, inactive]
 *                         description: Staff status
 *                         example: "active"
 *                       department:
 *                         type: string
 *                         description: Staff department
 *                         example: "Sample Collection"
 *       403:
 *         description: Forbidden - Only department managers can access
 * 
 * /api/appointment/staff/slots:
 *   get:
 *     tags: [appointments]
 *     summary: Get available slots for staff
 *     description: Get list of available time slots for the logged-in staff member
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Slot ID
 *                     example: "60d0fe4f5311236168a109cb"
 *                   time_slots:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         year:
 *                           type: number
 *                           description: Year
 *                           example: 2024
 *                         month:
 *                           type: number
 *                           description: Month
 *                           example: 3
 *                         day:
 *                           type: number
 *                           description: Day
 *                           example: 15
 *                         start_time:
 *                           type: object
 *                           properties:
 *                             hour:
 *                               type: number
 *                               description: Hour (24-hour format)
 *                               example: 9
 *                             minute:
 *                               type: number
 *                               description: Minute
 *                               example: 0
 *                   service_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Service ID
 *                         example: "60d0fe4f5311236168a109ca"
 *                       name:
 *                         type: string
 *                         description: Service name
 *                         example: "DNA Testing"
 *                       price:
 *                         type: number
 *                         description: Service price
 *                         example: 3000
 *                       duration:
 *                         type: number
 *                         description: Service duration in minutes
 *                         example: 60
 *       403:
 *         description: Forbidden - Only staff can access
 *       404:
 *         description: Staff profile not found
 * 
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
 *         collection_address:
 *           type: string
 *           description: Address for home collection (required when type is 'home')
 *           example: "123 Main St, City, Country"
 *         samples:
 *           type: array
 *           description: Sample types to be collected for this appointment
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [saliva, blood, hair, other]
 *                 description: Type of sample
 *                 example: "saliva"
 *           example: [{ "type": "saliva" }, { "type": "blood" }]
 *           deprecated: true
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
 *         - slot_id
 *       properties:
 *         slot_id:
 *           type: string
 *           description: ID of the time slot to confirm the appointment
 *           example: "60d0fe4f5311236168a109cb"
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
 *         user_id:
 *           type: string
 *           description: Filter appointments by user ID
 *           example: "60d0fe4f5311236168a109cf"
 *         service_id:
 *           type: string
 *           description: Filter appointments by service ID
 *           example: "60d0fe4f5311236168a109ca"
 *         staff_id:
 *           type: string
 *           description: Filter appointments by staff ID
 *           example: "60d0fe4f5311236168a109cc"
 *         start_date:
 *           type: string
 *           format: date
 *           description: Filter appointments from this date
 *           example: "2023-10-01"
 *         end_date:
 *           type: string
 *           format: date
 *           description: Filter appointments until this date
 *           example: "2023-10-31"
 *         type:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Filter by appointment type
 *           example: "facility"
 *         search_term:
 *           type: string
 *           description: Search term for customer name or address
 *           example: "John Doe"
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
