/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a1"
 *         payment_id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a2"
 *         staff_id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a3"
 *         customer_id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a4"
 *         sample_id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a5"
 *         receipt_number:
 *           type: string
 *           example: "PAY-12345-123456-abc123"
 *         payos_transaction_id:
 *           type: string
 *           example: "payos_12345"
 *         payos_payment_status:
 *           type: string
 *           enum: [pending, success, failed, cancelled, refunded]
 *           example: "success"
 *         payos_webhook_received_at:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         payos_payment_status_message:
 *           type: string
 *           example: "Payment successful"
 *         payos_payment_status_code:
 *           type: string
 *           example: "00"
 *         payos_payment_status_detail:
 *           type: string
 *           example: "Transaction completed successfully"
 *         payos_payment_status_time:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         transaction_date:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 */ 