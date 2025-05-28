/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *           example: "60d5ec9af682fbd12a0f4a1a"
 *         first_name:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         last_name:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         google_id:
 *           type: string
 *           description: Google ID (if applicable)
 *           example: ""
 *         role:
 *           type: string
 *           enum: [admin, manager, staff, customer, laboratory_technician]
 *           description: User role
 *           example: "customer"
 *         status:
 *           type: boolean
 *           description: User account status (true = active, false = inactive)
 *           example: true
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *           example: "+84912345678"
 *         avatar_url:
 *           type: string
 *           description: URL to user's avatar
 *           example: "https://example.com/avatars/user123.jpg"
 *         dob:
 *           type: string
 *           format: date
 *           description: Date of birth
 *           example: "1990-01-15"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: User's gender
 *           example: "male"
 *         address:
 *           type: string
 *           description: User's address
 *           example: "123 Main Street, City, Country"
 *         is_verified:
 *           type: boolean
 *           description: Email verification status
 *           example: true
 *         balance:
 *           type: number
 *           description: Current account balance
 *           example: 1000
 *         balance_total:
 *           type: number
 *           description: Total account balance
 *           example: 5000
 *         withdrawn_amount:
 *           type: number
 *           description: Total withdrawn amount
 *           example: 4000
 *         bank_name:
 *           type: string
 *           description: Bank name
 *           example: "Example Bank"
 *         bank_account_no:
 *           type: string
 *           description: Bank account number
 *           example: "1234567890"
 *         bank_account_name:
 *           type: string
 *           description: Bank account name
 *           example: "John Doe"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *           example: "2023-06-01T09:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Account last update date
 *           example: "2023-07-15T14:20:00.000Z"
 *
 *     RegisterDto:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - password
 *         - phone_number
 *       properties:
 *         google_id:
 *           type: string
 *           description: Google ID (optional)
 *           example: ""
 *         first_name:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         last_name:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password (minimum 6 characters)
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [customer, manager, staff, admin, laboratory_technician]
 *           description: User role (defaults to customer if not specified)
 *           example: "customer"
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *           example: "+84912345678"
 *         avatar_url:
 *           type: string
 *           description: URL to user's avatar
 *           example: "https://example.com/avatars/user123.jpg"
 *         dob:
 *           type: string
 *           format: date
 *           description: Date of birth
 *           example: "1990-01-15"
 *         address:
 *           type: string
 *           description: User's address
 *           example: "123 Main Street, City, Country"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: User's gender
 *           example: "male"
 *
 *     UpdateUserDto:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *       properties:
 *         first_name:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         last_name:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *           example: "+84912345678"
 *         avatar_url:
 *           type: string
 *           description: URL to user's avatar
 *           example: "https://example.com/avatars/user123.jpg"
 *         dob:
 *           type: string
 *           format: date
 *           description: Date of birth
 *           example: "1990-01-15"
 *         address:
 *           type: string
 *           description: User's address
 *           example: "123 Main Street, City, Country"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: User's gender
 *           example: "male"
 *
 *     ChangePasswordDto:
 *       type: object
 *       required:
 *         - user_id
 *         - old_password
 *         - new_password
 *       properties:
 *         user_id:
 *           type: string
 *           description: User ID
 *           example: "60d5ec9af682fbd12a0f4a1a"
 *         old_password:
 *           type: string
 *           description: Current password
 *           minLength: 6
 *           example: "oldPassword123"
 *         new_password:
 *           type: string
 *           description: New password
 *           minLength: 6
 *           example: "newPassword456"
 *
 *     ChangeStatusDto:
 *       type: object
 *       required:
 *         - user_id
 *         - status
 *       properties:
 *         user_id:
 *           type: string
 *           description: User ID
 *           example: "60d5ec9af682fbd12a0f4a1a"
 *         status:
 *           type: boolean
 *           description: New status (true=active, false=inactive)
 *           example: true
 *
 *     ChangeRoleDto:
 *       type: object
 *       required:
 *         - user_id
 *         - role
 *       properties:
 *         user_id:
 *           type: string
 *           description: User ID
 *           example: "60d5ec9af682fbd12a0f4a1a"
 *         role:
 *           type: string
 *           enum: [admin, manager, staff, customer, laboratory_technician]
 *           description: New user role
 *           example: "staff"
 *
 *     ReviewProfileDto:
 *       type: object
 *       required:
 *         - user_id
 *         - is_approved
 *       properties:
 *         user_id:
 *           type: string
 *           description: User ID
 *           example: "60d5ec9af682fbd12a0f4a1a"
 *         is_approved:
 *           type: boolean
 *           description: Approval status
 *           example: true
 *         notes:
 *           type: string
 *           description: Review notes
 *           example: "Profile information verified and approved"
 *
 *     SearchUserDto:
 *       type: object
 *       properties:
 *         keyword:
 *           type: string
 *           description: Search keyword (email, first name, last name)
 *           example: "john"
 *         role:
 *           type: string
 *           enum: ["", all, admin, manager, staff, customer, laboratory_technician]
 *           description: Filter by role
 *           example: "customer"
 *         is_verified:
 *           type: boolean
 *           description: Filter by verification status
 *           example: true
 *         status:
 *           type: boolean
 *           description: Filter by user status
 *           example: true
 *         is_deleted:
 *           type: boolean
 *           description: Include deleted users
 *           example: false
 *
 *     PaginationRequestModel:
 *       type: object
 *       properties:
 *         pageNum:
 *           type: integer
 *           minimum: 1
 *           description: Page number (starting from 1)
 *           default: 1
 *           example: 1
 *         pageSize:
 *           type: integer
 *           minimum: 1
 *           description: Number of items per page
 *           default: 10
 *           example: 10
 *
 *     SearchPaginationUserDto:
 *       type: object
 *       properties:
 *         pageInfo:
 *           $ref: '#/components/schemas/PaginationRequestModel'
 *         searchCondition:
 *           $ref: '#/components/schemas/SearchUserDto'
 *
 *     SearchPaginationResponse:
 *       type: object
 *       properties:
 *         pageData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserResponse'
 *         pageInfo:
 *           type: object
 *           properties:
 *             pageNum:
 *               type: integer
 *               description: Current page number
 *               example: 1
 *             pageSize:
 *               type: integer
 *               description: Number of items per page
 *               example: 10
 *             totalItems:
 *               type: integer
 *               description: Total number of items
 *               example: 25
 *             totalPages:
 *               type: integer
 *               description: Total number of pages
 *               example: 3
 */ 