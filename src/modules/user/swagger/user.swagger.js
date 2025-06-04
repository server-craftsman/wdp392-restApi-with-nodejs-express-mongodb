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
 *                 type: string
 *                 example: "123 Main Street, City, Country"
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
 *                 type: string
 *                 example: "123 Main Street, City, Country"
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
 *     description: Update user profile information (own profile or Admin access), with optional avatar upload
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
 *             required:
 *               - first_name
 *               - last_name
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
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
 *                 type: string
 *                 example: "123 Main Street, City, Country"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
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