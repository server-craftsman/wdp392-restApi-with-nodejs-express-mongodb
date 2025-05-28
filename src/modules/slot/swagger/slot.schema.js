/**
 * @swagger
 * components:
 *   schemas:
 *     TimePoint:
 *       type: object
 *       required:
 *         - hour
 *         - minute
 *       properties:
 *         hour:
 *           type: integer
 *           minimum: 0
 *           maximum: 23
 *           description: Hour (0-23)
 *           example: 9
 *         minute:
 *           type: integer
 *           minimum: 0
 *           maximum: 59
 *           description: Minute (0-59)
 *           example: 30
 *
 *     TimeSlot:
 *       type: object
 *       required:
 *         - year
 *         - month
 *         - day
 *         - start_time
 *         - end_time
 *       properties:
 *         year:
 *           type: integer
 *           description: Year
 *           example: 2023
 *         month:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Month (1-12)
 *           example: 10
 *         day:
 *           type: integer
 *           minimum: 1
 *           maximum: 31
 *           description: Day (1-31)
 *           example: 15
 *         start_time:
 *           $ref: '#/components/schemas/TimePoint'
 *         end_time:
 *           $ref: '#/components/schemas/TimePoint'
 *
 *     CreateSlotDto:
 *       type: object
 *       required:
 *         - staff_profile_ids
 *         - service_id
 *         - time_slots
 *         - appointment_limit
 *       properties:
 *         staff_profile_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of staff profile IDs assigned to this slot
 *           example: ["60d5ec9af682fbd12a0f4a1b"]
 *         service_id:
 *           type: string
 *           description: Service ID associated with this slot
 *           example: "60d5ec9af682fbd12a0f4a2c"
 *         time_slots:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TimeSlot'
 *           description: Array of time slots
 *         appointment_limit:
 *           type: integer
 *           minimum: 1
 *           description: Maximum number of appointments allowed for this slot
 *           example: 1
 *
 *     UpdateSlotDto:
 *       type: object
 *       required:
 *         - staff_profile_ids
 *         - service_id
 *         - time_slots
 *         - appointment_limit
 *       properties:
 *         staff_profile_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of staff profile IDs assigned to this slot
 *           example: ["60d5ec9af682fbd12a0f4a1b"]
 *         service_id:
 *           type: string
 *           description: Service ID associated with this slot
 *           example: "60d5ec9af682fbd12a0f4a2c"
 *         time_slots:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TimeSlot'
 *           description: Array of time slots
 *         appointment_limit:
 *           type: integer
 *           minimum: 1
 *           description: Maximum number of appointments allowed for this slot
 *           example: 1
 *         status:
 *           type: string
 *           enum: [available, booked, unavailable]
 *           description: Slot status
 *           example: "available"
 *
 *     SlotResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Slot ID
 *           example: "60d5ec9af682fbd12a0f4a3d"
 *         staff_profile_ids:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 example: "60d5ec9af682fbd12a0f4a1b"
 *               employee_id:
 *                 type: string
 *                 example: "EMP-2023-001"
 *               job_title:
 *                 type: string
 *                 example: "Laboratory Technician"
 *               user_id:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60d5ec9af682fbd12a0f4a1a"
 *                   first_name:
 *                     type: string
 *                     example: "John"
 *                   last_name:
 *                     type: string
 *                     example: "Doe"
 *                   email:
 *                     type: string
 *                     example: "john.doe@example.com"
 *         service_id:
 *           type: string
 *           description: Service ID associated with this slot
 *           example: "60d5ec9af682fbd12a0f4a2c"
 *         appointment_id:
 *           type: string
 *           description: Associated appointment ID (if booked)
 *           example: "60d5ec9af682fbd12a0f4a4d"
 *         appointment_limit:
 *           type: integer
 *           description: Maximum number of appointments allowed for this slot
 *           example: 1
 *         time_slots:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TimeSlot'
 *           description: Array of time slots
 *         status:
 *           type: string
 *           enum: [available, booked, unavailable]
 *           description: Slot status
 *           example: "available"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *           example: "2023-07-15T09:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *           example: "2023-07-16T14:20:00.000Z"
 *
 *     SlotPaginationResponse:
 *       type: object
 *       properties:
 *         pageData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SlotResponse'
 *         pageInfo:
 *           type: object
 *           properties:
 *             totalItems:
 *               type: integer
 *               description: Total number of items
 *               example: 45
 *             totalPages:
 *               type: integer
 *               description: Total number of pages
 *               example: 5
 *             pageNum:
 *               type: integer
 *               description: Current page number
 *               example: 1
 *             pageSize:
 *               type: integer
 *               description: Number of items per page
 *               example: 10
 *
 *     DepartmentPerformanceResponse:
 *       type: object
 *       properties:
 *         totalStaff:
 *           type: integer
 *           description: Total number of active staff in the department
 *           example: 10
 *         totalSlots:
 *           type: integer
 *           description: Total number of slots in the department
 *           example: 120
 *         bookedSlots:
 *           type: integer
 *           description: Number of booked slots in the department
 *           example: 85
 *         bookingRate:
 *           type: number
 *           format: float
 *           description: Booking rate as a percentage (bookedSlots/totalSlots * 100)
 *           example: 70.83
 *
 *     StatusChangeRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [available, booked, unavailable]
 *           description: New slot status
 *           example: "available"
 */
