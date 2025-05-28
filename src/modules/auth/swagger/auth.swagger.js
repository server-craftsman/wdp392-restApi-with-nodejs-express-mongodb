/**
 * @swagger
 * tags:
 *   name: auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth:
 *   post:
 *     tags:
 *       - auth
 *     summary: Login with email and password
 *     description: Authenticate a user with email and password credentials
 *     operationId: login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: Login successful, returns authentication token and user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Invalid input - email format invalid or password too short
 *       401:
 *         description: Authentication failed - wrong email or password
 *       404:
 *         description: User not found
 *       422:
 *         description: User account is inactive or email not verified
 *   
 *   get:
 *     tags:
 *       - auth
 *     summary: Get current logged-in user
 *     description: Retrieve information about the currently authenticated user
 *     operationId: getCurrentLoginUser
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Current user information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized - valid authentication token required
 *       404:
 *         description: User not found or deleted
 */

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     tags:
 *       - auth
 *     summary: Login with Google
 *     description: Authenticate a user with Google credentials (create account if not exists)
 *     operationId: loginWithGoogle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               google_id:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Login successful, returns authentication token and user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       201:
 *         description: New user created with Google credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Invalid input - missing required fields
 *       422:
 *         description: User account is inactive
 */

/**
 * @swagger
 * /api/auth/verify-token:
 *   post:
 *     tags:
 *       - auth
 *     summary: Verify email with token
 *     description: Verify user's email address using the verification token sent via email
 *     operationId: verifyToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifiedTokenDto'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerificationResponse'
 *       400:
 *         description: Invalid input - token missing or malformed
 *       404:
 *         description: User not found
 *       410:
 *         description: Token expired or invalid
 */

/**
 * @swagger
 * /api/auth/resend-token:
 *   post:
 *     tags:
 *       - auth
 *     summary: Resend verification token
 *     description: Resend the email verification token to the user's email address
 *     operationId: resendToken
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailDto'
 *     responses:
 *       200:
 *         description: Verification token resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification token has been sent to your email"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid input - email format invalid
 *       404:
 *         description: User not found with provided email
 *       409:
 *         description: Email already verified
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   put:
 *     tags:
 *       - auth
 *     summary: Request password reset
 *     description: Send a password reset link to the user's email address
 *     operationId: forgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailDto'
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPasswordResponse'
 *       400:
 *         description: Invalid input - email format invalid
 *       404:
 *         description: User not found with provided email
 */

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     tags:
 *       - auth
 *     summary: Logout current user
 *     description: Invalidate the current user's authentication token
 *     operationId: logout
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *       401:
 *         description: Unauthorized - valid authentication token required
 */
