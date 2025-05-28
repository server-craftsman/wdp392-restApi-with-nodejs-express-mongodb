/**
 * @swagger
 * tags:
 *   name: slots
 *   description: Slot management
 */

/**
 * @swagger
 * /api/slot/create:
 *   post:
 *     tags:
 *       - slots
 *     summary: Create a new slot (Admin, Manager only)
 *     description: Create a new time slot for staff profiles
 *     operationId: createSlot
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSlotDto'
 *     responses:
 *       201:
 *         description: Slot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SlotResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Slot overlaps with an existing slot
 */

/**
 * @swagger
 * /api/slot/search:
 *   get:
 *     tags:
 *       - slots
 *     summary: Search slots with filters (Admin, Manager, Laboratory Technician, Staff only)
 *     description: Search for slots with pagination and filtering by multiple criteria
 *     operationId: getSlots
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
 *         name: staff_profile_ids
 *         schema:
 *           type: string
 *         description: Filter by staff profile IDs (comma-separated or single value)
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: appointment_id
 *         schema:
 *           type: string
 *         description: Filter by appointment ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, booked, unavailable]
 *         description: Filter by slot status
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (inclusive)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (inclusive)
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: start_time
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           default: asc
 *           enum: [asc, desc]
 *         description: "Sort order (asc: ascending, desc: descending)"
 *     responses:
 *       200:
 *         description: List of slots with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SlotPaginationResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/slot/available:
 *   get:
 *     tags:
 *       - slots
 *     summary: Get available slots for booking
 *     description: Retrieve available slots for booking with optional filters
 *     operationId: getAvailableSlots
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date to search for available slots
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date to search for available slots (defaults to 7 days from start_date if not provided)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [self_collected, facility_collected, home_collected]
 *         description: Filter by sample collection method
 *     responses:
 *       200:
 *         description: Available slots with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SlotPaginationResponse'
 *       400:
 *         description: Invalid input (e.g., missing required parameters)
 */

/**
 * @swagger
 * /api/slot/{id}:
 *   get:
 *     tags:
 *       - slots
 *     summary: Get slot by ID (Admin, Manager, Laboratory Technician, Staff only)
 *     description: Retrieve slot details by ID
 *     operationId: getSlotById
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Slot ID
 *     responses:
 *       200:
 *         description: Slot details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SlotResponse'
 *       400:
 *         description: Invalid slot ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Slot not found
 *
 *   put:
 *     tags:
 *       - slots
 *     summary: Update slot (Admin, Manager only)
 *     description: Update slot information
 *     operationId: updateSlot
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSlotDto'
 *     responses:
 *       200:
 *         description: Slot updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SlotResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Slot overlaps with an existing slot
 */

/**
 * @swagger
 * /api/slot/{id}/status:
 *   patch:
 *     tags:
 *       - slots
 *     summary: Change slot status (Admin, Manager only)
 *     description: Change the status of a slot
 *     operationId: changeSlotStatus
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Slot ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusChangeRequest'
 *     responses:
 *       200:
 *         description: Slot status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SlotResponse'
 *       400:
 *         description: Invalid input or cannot change status of a booked slot
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Slot not found
 */

/**
 * @swagger
 * /api/slot/staff/{id}:
 *   get:
 *     tags:
 *       - slots
 *     summary: Get slots by user ID (Admin, Manager, Laboratory Technician, Staff only)
 *     description: Retrieve slots associated with a specific user's staff profile
 *     operationId: getSlotsByUser
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (inclusive)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (inclusive)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, booked, unavailable]
 *         description: Filter by slot status
 *     responses:
 *       200:
 *         description: List of slots for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SlotPaginationResponse'
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found or staff profile not found for this user
 */

/**
 * @swagger
 * /api/slot/department/{departmentId}:
 *   get:
 *     tags:
 *       - slots
 *     summary: Get slots by department ID (Admin, Manager only)
 *     description: Retrieve slots associated with a specific department
 *     operationId: getSlotsByDepartment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
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
 *         name: staff_profile_ids
 *         schema:
 *           type: string
 *         description: Filter by specific staff profile IDs within department
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (inclusive)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (inclusive)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, booked, unavailable]
 *         description: Filter by slot status
 *     responses:
 *       200:
 *         description: List of slots for the department
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SlotPaginationResponse'
 *       400:
 *         description: Invalid department ID
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/department/{departmentId}/statistics:
 *   get:
 *     tags:
 *       - slots
 *       - departments
 *     summary: Get department performance statistics (Admin, Manager only)
 *     description: Retrieve performance statistics for a specific department
 *     operationId: getDepartmentPerformance
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (inclusive)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (inclusive)
 *     responses:
 *       200:
 *         description: Department performance statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentPerformanceResponse'
 *       400:
 *         description: Invalid department ID
 *       401:
 *         description: Unauthorized
 */
