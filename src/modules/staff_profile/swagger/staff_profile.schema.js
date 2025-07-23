/**
 * @swagger
 * components:
 *   schemas:
 *     Qualification:
 *       type: object
 *       required:
 *         - name
 *         - institution
 *         - issue_date
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the qualification or certification
 *           example: "Medical Laboratory Technician Certification"
 *         institution:
 *           type: string
 *           description: Institution that issued the qualification
 *           example: "American Medical Technologists"
 *         issue_date:
 *           type: string
 *           format: date
 *           description: Date when the qualification was issued
 *           example: "2020-01-15"
 *         expiry_date:
 *           type: string
 *           format: date
 *           description: Date when the qualification expires (if applicable)
 *           example: "2025-01-15"
 *         description:
 *           type: string
 *           description: Additional details about the qualification
 *           example: "National certification for laboratory technicians"
 *
 *     CreateStaffProfileDto:
 *       type: object
 *       required:
 *         - user_id
 *         - department_id
 *         - job_title
 *         - hire_date
 *         - salary
 *       properties:
 *         user_id:
 *           type: string
 *           description: ID of the user to associate with this staff profile
 *           example: "60d5ec9af682fbd12a0f4a1a"
 *         department_id:
 *           type: string
 *           description: ID of the department where the staff works
 *           example: "60d5ec9af682fbd12a0f4b2b"
 *         job_title:
 *           type: string
 *           description: Job title or position of the staff
 *           example: "Laboratory Technician"
 *         hire_date:
 *           type: string
 *           format: date
 *           description: Date when the staff was hired
 *           example: "2023-06-01"
 *         address:
 *           type: object
 *           description: Address of the staff
 *           example: {
 *             street: "123 Main St",
 *             ward: "Downtown",
 *             district: "Central",
 *             city: "New York",
 *             country: "USA"
 *           }
 *         salary:
 *           type: number
 *           description: Monthly salary amount
 *           example: 5000
 *         qualifications:
 *           type: array
 *           description: List of qualifications and certifications
 *           items:
 *             $ref: '#/components/schemas/Qualification'
 *
 *     UpdateStaffProfileDto:
 *       type: object
 *       required:
 *         - department_id
 *         - job_title
 *         - hire_date
 *         - salary
 *         - qualifications
 *       properties:
 *         department_id:
 *           type: string
 *           description: ID of the department where the staff works
 *           example: "60d5ec9af682fbd12a0f4b2b"
 *         job_title:
 *           type: string
 *           description: Job title or position of the staff
 *           example: "Senior Laboratory Technician"
 *         hire_date:
 *           type: string
 *           format: date
 *           description: Date when the staff was hired
 *           example: "2023-06-01"
 *         address:
 *           type: object
 *           description: Address of the staff
 *           example: {
 *             street: "123 Main St",
 *             ward: "Downtown",
 *             district: "Central",
 *             city: "New York",
 *             country: "USA"
 *           }
 *         salary:
 *           type: number
 *           description: Monthly salary amount
 *           example: 5500
 *         qualifications:
 *           type: array
 *           description: List of qualifications and certifications
 *           items:
 *             $ref: '#/components/schemas/Qualification'
 *
 *     StaffProfileResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Staff profile ID
 *           example: "60d5ec9af682fbd12a0f4c3c"
 *         user_id:
 *           type: object
 *           description: User information
 *           properties:
 *             _id:
 *               type: string
 *               example: "60d5ec9af682fbd12a0f4a1a"
 *             first_name:
 *               type: string
 *               example: "John"
 *             last_name:
 *               type: string
 *               example: "Doe"
 *             email:
 *               type: string
 *               example: "john.doe@example.com"
 *         department_id:
 *           type: object
 *           description: Department information
 *           properties:
 *             _id:
 *               type: string
 *               example: "60d5ec9af682fbd12a0f4b2b"
 *             name:
 *               type: string
 *               example: "Laboratory"
 *         job_title:
 *           type: string
 *           description: Job title or position
 *           example: "Laboratory Technician"
 *         hire_date:
 *           type: string
 *           format: date
 *           description: Date when the staff was hired
 *           example: "2023-06-01"
 *         zone:
 *           type: string
 *           description: Zone of the staff
 *           example: "Zone 1"
 *         employee_id:
 *           type: string
 *           description: Unique employee identifier
 *           example: "EMP-2023-001"
 *         salary:
 *           type: number
 *           description: Monthly salary amount
 *           example: 5000
 *         status:
 *           type: string
 *           enum: [active, on_leave, terminated]
 *           description: Current employment status
 *           example: "active"
 *         qualifications:
 *           type: array
 *           description: List of qualifications and certifications
 *           items:
 *             $ref: '#/components/schemas/Qualification'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the record was created
 *           example: "2023-06-01T09:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the record was last updated
 *           example: "2023-07-15T14:20:00.000Z"
 *
 *     StaffProfilePaginationResponse:
 *       type: object
 *       properties:
 *         pageData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StaffProfileResponse'
 *         pageInfo:
 *           type: object
 *           properties:
 *             totalItems:
 *               type: integer
 *               description: Total number of staff profiles
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
 *     StatusChangeRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, on_leave, terminated]
 *           description: New staff status
 *           example: "on_leave"
 */
