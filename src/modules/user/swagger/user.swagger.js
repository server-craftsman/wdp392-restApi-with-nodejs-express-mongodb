/**
 * @swagger
 * tags:
 *   name: users
 *   description: User management APIs
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register new user
 *     description: Register a new user account with email and password, with optional avatar upload
 *     tags: [users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - phone_number
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [customer, manager, staff, laboratory_technician]
 *                 example: "customer"
 *               phone_number:
 *                 type: string
 *                 example: "+84912345678"
 *               avatar_image:
 *                 type: string
 *                 format: binary
 *                 description: User's avatar image (jpg, jpeg, png, gif) - optional
 *               avatar_url:
 *                 type: string
 *                 description: URL to avatar (can be provided directly or uploaded via avatar_image field)
 *                 example: "https://example.com/avatars/user123.jpg"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-15"
 *               address:
 *                 type: object
 *                 example: {
 *                   street: "123 Main Street",
 *                   ward: "Ward 1",
 *                   district: "District 1",
 *                   city: "HCM",
 *                   country: "Việt Nam"
 *                 }
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input or email already in use
 *       409:
 *         description: User with this email already exists
 */

/**
 * @swagger
 * /api/users/google:
 *   post:
 *     summary: Register with Google
 *     description: Register a new user with Google account or login if account exists
 *     tags: [users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - google_id
 *             properties:
 *               google_id:
 *                 type: string
 *                 description: Google account ID
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create user (Admin only)
 *     description: Create a new user with specified role (Admin only), with optional avatar upload
 *     tags: [users]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - phone_number
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [customer, manager, staff, admin, laboratory_technician]
 *                 example: "customer"
 *               phone_number:
 *                 type: string
 *                 example: "+84912345678"
 *               avatar_image:
 *                 type: string
 *                 format: binary
 *                 description: User's avatar image (jpg, jpeg, png, gif) - optional
 *               avatar_url:
 *                 type: string
 *                 description: URL to avatar (can be provided directly or uploaded via avatar_image field)
 *                 example: "https://example.com/avatars/user123.jpg"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-15"
 *               address:
 *                 type: object
 *                 example: {
 *                   street: "123 Main Street",
 *                   ward: "Ward 1",
 *                   district: "District 1",
 *                   city: "HCM",
 *                   country: "Việt Nam"
 *                 }
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input or email already in use
 *       401:
 *         description: Unauthorized - Admin access required
 *       409:
 *         description: User with this email already exists
 */

/**
 * @swagger
 * /api/users/search:
 *   post:
 *     summary: Search users (Admin only)
 *     description: Search for users with pagination and filtering options
 *     tags: [users]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchPaginationUserDto'
 *     responses:
 *       200:
 *         description: Search results with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchPaginationResponse'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized - Admin access required
 */

/**
 * @swagger
 * /api/users/search-customer:
 *   get:
 *     tags: [users]
 *     summary: Search customer by phone or email (Staff convenience)
 *     description: Search for a customer by phone number or email address. Returns customer information including their administrative cases. Accessible by Staff, Manager, and Admin only.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number (digits only) or email address to search for
 *         example: "john.doe@example.com"
 *         examples:
 *           email:
 *             summary: Search by email
 *             value: "john.doe@example.com"
 *           phone:
 *             summary: Search by phone number
 *             value: "84912345678"
 *     responses:
 *       200:
 *         description: Customer found successfully
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
 *                   example: "Customer found successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Customer ID
 *                       example: "60d5ec9af682fbd12a0f4a1a"
 *                     first_name:
 *                       type: string
 *                       description: Customer's first name
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       description: Customer's last name
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       description: Customer's email address
 *                       example: "john.doe@example.com"
 *                     phone_number:
 *                       type: number
 *                       description: Customer's phone number
 *                       example: 84912345678
 *                     role:
 *                       type: string
 *                       enum: [customer]
 *                       description: Customer role
 *                       example: "customer"
 *                     status:
 *                       type: boolean
 *                       description: Account status
 *                       example: true
 *                     is_verified:
 *                       type: boolean
 *                       description: Email verification status
 *                       example: true
 *                     avatar_url:
 *                       type: string
 *                       description: Avatar URL
 *                       example: "https://example.com/avatar.jpg"
 *                     dob:
 *                       type: string
 *                       format: date
 *                       description: Date of birth
 *                       example: "1990-01-15"
 *                     gender:
 *                       type: string
 *                       enum: [male, female, other]
 *                       description: Gender
 *                       example: "male"
 *                     address:
 *                       type: object
 *                       description: Address information
 *                       properties:
 *                         street:
 *                           type: string
 *                           example: "123 Main Street"
 *                         ward:
 *                           type: string
 *                           example: "Ward 1"
 *                         district:
 *                           type: string
 *                           example: "District 1"
 *                         city:
 *                           type: string
 *                           example: "HCM"
 *                         country:
 *                           type: string
 *                           example: "Việt Nam"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Account creation date
 *                       example: "2023-06-01T09:30:00.000Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       description: Last update date
 *                       example: "2023-07-15T14:20:00.000Z"
 *                     administrative_cases:
 *                       type: array
 *                       description: Customer's administrative cases
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Case ID
 *                             example: "60d5ec9af682fbd12a0f4a1b"
 *                           case_number:
 *                             type: string
 *                             description: Case number
 *                             example: "PL-2024-001"
 *                           case_type:
 *                             type: string
 *                             enum: [paternity, maternity, sibling, grandparent, other]
 *                             description: Type of DNA test case
 *                             example: "paternity"
 *                           status:
 *                             type: string
 *                             enum: [pending, approved, rejected, completed]
 *                             description: Case status
 *                             example: "approved"
 *                           requesting_agency:
 *                             type: string
 *                             description: Requesting agency name
 *                             example: "Tòa án nhân dân TP.HCM"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             description: Case creation date
 *                             example: "2024-01-15T00:00:00.000Z"
 *       400:
 *         description: Bad request - Search term is required
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
 *                   example: "Search term is required"
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Staff, Manager, or Admin access required
 *       404:
 *         description: Customer not found
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
 *                   example: "Customer not found"
 *                 data:
 *                   type: null
 *                   example: null
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Get user information by ID (own profile or Admin access)
 *     tags: [users]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "60d5ec9af682fbd12a0f4a1a"
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Cannot access other user's profile
 *       404:
 *         description: User not found
 *
 *   put:
 *     summary: Update user profile
 *     description: Update user profile information (own profile or Admin access), with optional avatar upload. All fields are optional - only provided fields will be updated. Address can be provided as JSON string or object - both formats are supported.
 *     tags: [users]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "60d5ec9af682fbd12a0f4a1a"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: User's first name (optional)
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 description: User's last name (optional)
 *                 example: "Doe"
 *               phone_number:
 *                 type: string
 *                 description: User's phone number (optional)
 *                 example: "+84912345678"
 *               avatar_image:
 *                 type: string
 *                 format: binary
 *                 description: User's avatar image (jpg, jpeg, png, gif) - optional
 *               avatar_url:
 *                 type: string
 *                 description: URL to avatar (can be provided directly or uploaded via avatar_image field)
 *                 example: "https://example.com/avatars/user123.jpg"
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth (optional)
 *                 example: "1990-01-15"
 *               address:
 *                 oneOf:
 *                   - type: string
 *                     description: Address as JSON string (will be parsed automatically)
 *                     example: "{\"street\":\"123 Main Street\",\"ward\":\"Ward 1\",\"district\":\"District 1\",\"city\":\"HCM\",\"country\":\"Việt Nam\"}"
 *                   - type: object
 *                     description: Address as object
 *                     properties:
 *                       street:
 *                         type: string
 *                         description: Street address
 *                         example: "123 Main Street"
 *                       ward:
 *                         type: string
 *                         description: Ward/commune
 *                         example: "Ward 1"
 *                       district:
 *                         type: string
 *                         description: District
 *                         example: "District 1"
 *                       city:
 *                         type: string
 *                         description: City/province
 *                         example: "HCM"
 *                       country:
 *                         type: string
 *                         description: Country
 *                         example: "Việt Nam"
 *                     example: {
 *                       street: "123 Main Street",
 *                       ward: "Ward 1",
 *                       district: "District 1",
 *                       city: "HCM",
 *                       country: "Việt Nam"
 *                     }
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: User's gender (optional)
 *                 example: "male"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Cannot update other user's profile
 *       404:
 *         description: User not found
 *
 *   delete:
 *     summary: Delete user (Admin only)
 *     description: Delete user by ID (soft delete - Admin only)
 *     tags: [users]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "60d5ec9af682fbd12a0f4a1a"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change password
 *     description: Change user password (requires old password verification)
 *     tags: [users]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordDto'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input or incorrect old password
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/change-status:
 *   put:
 *     summary: Change user status (Admin only)
 *     description: Enable or disable a user account (Admin only)
 *     tags: [users]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeStatusDto'
 *     responses:
 *       200:
 *         description: User status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/change-role:
 *   put:
 *     summary: Change user role (Admin only)
 *     description: Change the role of a user account (Admin only)
 *     tags: [users]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeRoleDto'
 *     responses:
 *       200:
 *         description: User role changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/staff-lab-tech:
 *   get:
 *     tags: [users]
 *     summary: Get staff and laboratory technician users (Admin and Manager only)
 *     description: Retrieve list of all staff and laboratory technician users with their profiles
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                         description: User ID
 *                       first_name:
 *                         type: string
 *                         description: User's first name
 *                       last_name:
 *                         type: string
 *                         description: User's last name
 *                       email:
 *                         type: string
 *                         description: User's email
 *                       phone_number:
 *                         type: string
 *                         description: User's phone number
 *                       role:
 *                         type: string
 *                         enum: [STAFF, LABORATORY_TECHNICIAN]
 *                         description: User's role
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
 */