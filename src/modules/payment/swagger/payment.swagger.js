/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     tags:
 *       - payment
 *     summary: PayOS webhook
 *     description: Endpoint to receive payment notifications from PayOS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentWebhookRequest'
 *     responses:
 *       '200':
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment successful"
 *       '400':
 *         description: Bad request
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
 * /api/payment/appointment:
 *   post:
 *     tags:
 *       - payment
 *     summary: Create a payment for an appointment with selected payment method (Customer only)
 *     description: Creates a new payment for an appointment with CASH or PAY_OS payment method
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentPaymentRequest'
 *     responses:
 *       '200':
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
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
 *       '403':
 *         description: Forbidden
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
 * /api/payment/verify/{paymentNo}:
 *   get:
 *     tags:
 *       - payment
 *     summary: Verify payment status (All authenticated users)
 *     description: Verify the status of a payment by payment number
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: paymentNo
 *         in: path
 *         required: true
 *         description: Payment number to verify
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Payment verification completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentVerificationResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Payment not found
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
 * /api/payment/cancel/{paymentNo}:
 *   post:
 *     tags:
 *       - payment
 *     summary: Cancel payment (All authenticated users)
 *     description: Cancel a pending payment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: paymentNo
 *         in: path
 *         required: true
 *         description: Payment number to cancel
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Payment cancelled successfully
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
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Payment cancelled successfully"
 *                 message:
 *                   type: string
 *                   example: "Payment cancelled successfully"
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Payment not found
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
 * /api/payment/success:
 *   get:
 *     tags:
 *       - payment
 *     summary: Handle successful payment redirect
 *     description: Endpoint for handling successful payment redirects from payment gateway
 *     parameters:
 *       - name: orderCode
 *         in: query
 *         required: false
 *         description: Order code from payment gateway
 *         schema:
 *           type: string
 *       - name: amount
 *         in: query
 *         required: false
 *         description: Payment amount
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         required: false
 *         description: Payment status
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Payment success handler
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
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                 message:
 *                   type: string
 *                   example: "Payment completed successfully"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payment/failed:
 *   get:
 *     tags:
 *       - payment
 *     summary: Handle failed payment redirect
 *     description: Endpoint for handling failed payment redirects from payment gateway
 *     parameters:
 *       - name: orderCode
 *         in: query
 *         required: false
 *         description: Order code from payment gateway
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Payment failure handler
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
 *                     status:
 *                       type: string
 *                       example: "failed"
 *                 message:
 *                   type: string
 *                   example: "Payment was cancelled or failed"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message"
 *         statusCode:
 *           type: integer
 *           example: 400
 *     
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a1"
 *         appointment_id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a2"
 *         sample_ids:
 *           type: array
 *           items:
 *             type: string
 *           example: ["5f8d0e0e9d3b9a0017c1a7a3", "5f8d0e0e9d3b9a0017c1a7a4"]
 *         amount:
 *           type: number
 *           example: 100000
 *         payment_no:
 *           type: string
 *           example: "PAY-12345-123456"
 *         payment_method:
 *           type: string
 *           enum: [cash, pay_os]
 *           example: "pay_os"
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *           example: "completed"
 *         balance_origin:
 *           type: number
 *           example: 0
 *         payos_payment_id:
 *           type: string
 *           example: "payos_12345"
 *         payos_payment_url:
 *           type: string
 *           example: "https://pay.payos.vn/web/payment/12345"
 *         payos_payment_status:
 *           type: string
 *           example: "PAID"
 *         order_code:
 *           type: string
 *           example: "PAY-12345-123456"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /api/payment/{paymentId}/samples: 
 *   get:
 *     tags:
 *       - payment
 *     summary: Get samples for a payment (All authenticated users)
 *     description: Retrieve all samples associated with a specific payment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: paymentId
 *         in: path
 *         required: true
 *         description: ID of the payment
 *         schema:
 *           type: string
 *     responses:
 *       '200':
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
 *                     $ref: '#/components/schemas/Sample'
 *                 message:
 *                   type: string
 *                   example: "Samples retrieved successfully"
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Payment not found
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