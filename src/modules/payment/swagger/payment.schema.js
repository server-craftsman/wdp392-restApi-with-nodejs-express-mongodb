/**
 * @swagger
 * components:
 *   schemas:
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
 *     
 *     CreatePaymentRequest:
 *       type: object
 *       properties:
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment to pay for
 *           example: "5f8d0e0e9d3b9a0017c1a7a1"
 *         amount:
 *           type: number
 *           description: Payment amount
 *           example: 100000
 *         buyer_name:
 *           type: string
 *           description: Name of the buyer
 *           example: "John Doe"
 *         buyer_email:
 *           type: string
 *           description: Email of the buyer
 *           example: "john.doe@example.com"
 *         buyer_phone:
 *           type: string
 *           description: Phone number of the buyer
 *           example: "0123456789"
 *       required:
 *         - appointment_id
 *         - amount
 *         - buyer_name
 *         - buyer_phone
 *     
 *     CreateAppointmentPaymentRequest:
 *       type: object
 *       properties:
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment to pay for
 *           example: "5f8d0e0e9d3b9a0017c1a7a1"
 *         payment_method:
 *           type: string
 *           description: Payment method (cash or pay_os)
 *           enum: [cash, pay_os]
 *           example: "pay_os"
 *         sample_ids:
 *           type: array
 *           description: Optional array of sample IDs to associate with this payment. If not provided, all samples for the appointment will be included automatically.
 *           items:
 *             type: string
 *           example: ["5f8d0e0e9d3b9a0017c1a7a2", "5f8d0e0e9d3b9a0017c1a7a3"]
 *       required:
 *         - appointment_id
 *         - payment_method
 *     
 *     CreateSamplePaymentRequest:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           description: Payment amount
 *           example: 100000
 *       required:
 *         - amount
 *     
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           oneOf:
 *             - type: string
 *               description: Checkout URL for PayOS payments
 *               example: "https://pay.payos.vn/web/payment/12345"
 *             - type: object
 *               properties:
 *                 payment_no:
 *                   type: string
 *                   example: "PAY-12345-123456"
 *                 payment_method:
 *                   type: string
 *                   example: "pay_os"
 *                 status:
 *                   type: string
 *                   example: "pending"
 *                 amount:
 *                   type: number
 *                   example: 100000
 *                 checkout_url:
 *                   type: string
 *                   example: "https://pay.payos.vn/web/payment/12345"
 *         message:
 *           type: string
 *           example: "Payment created successfully"
 *     
 *     PaymentVerificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             payment_status:
 *               type: string
 *               example: "completed"
 *             appointment_id:
 *               type: string
 *               example: "5f8d0e0e9d3b9a0017c1a7a1"
 *         message:
 *           type: string
 *           example: "Payment verification completed"
 *     
 *     PaymentWebhookRequest:
 *       type: object
 *       properties:
 *         orderCode:
 *           type: string
 *           description: Order code
 *           example: "PAY-12345-123456"
 *         amount:
 *           type: number
 *           description: Payment amount
 *           example: 100000
 *         status:
 *           type: string
 *           description: Payment status
 *           example: "PAID"
 *         signature:
 *           type: string
 *           description: Signature for verification
 *           example: "abc123"
 *       required:
 *         - orderCode
 *         - amount
 *         - status
 *         - signature
 *     
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
 *     Sample:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a3"
 *         appointment_id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a2"
 *         kit_id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a4"
 *         type:
 *           type: string
 *           enum: [blood, saliva, urine, stool, tissue]
 *           example: "blood"
 *         collection_method:
 *           type: string
 *           enum: [self, facility, home]
 *           example: "facility"
 *         collection_date:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         status:
 *           type: string
 *           enum: [pending, collected, received, testing, completed, rejected]
 *           example: "collected"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 */ 