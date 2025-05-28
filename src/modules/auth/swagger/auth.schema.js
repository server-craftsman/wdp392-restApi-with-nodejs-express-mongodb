/**
 * @swagger
 * components:
 *   schemas:
 *     LoginDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "thichtamphuc@gmail.com"
 *         password:
 *           type: string
 *           description: User's password (minimum 6 characters)
 *           minLength: 6
 *           example: "123456"
 *     LoginGoogleDto:
 *       type: object
 *       properties:
 *         google_id:
 *           type: string
 *           description: Google ID token
 *
 *     VerifiedTokenDto:
 *       type: object
 *       required:
 *         - verifiedToken
 *       properties:
 *         verifiedToken:
 *           type: string
 *           description: Verification token sent to user's email
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     EmailDto:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *
 *     TokenResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/UserResponse'
 *
 *     AuthErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Invalid email or password"
 *         status:
 *           type: integer
 *           description: HTTP status code
 *           example: 401
 *
 *     ForgotPasswordResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Password reset email sent successfully"
 *         success:
 *           type: boolean
 *           description: Operation success status
 *           example: true
 *
 *     VerificationResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Email verified successfully"
 *         success:
 *           type: boolean
 *           description: Operation success status
 *           example: true
 *         user:
 *           $ref: '#/components/schemas/UserResponse'
 *
 *     LogoutResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Logged out successfully"
 *         success:
 *           type: boolean
 *           description: Operation success status
 *           example: true
 */
