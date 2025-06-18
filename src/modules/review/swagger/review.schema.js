/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Review ID
 *         rating:
 *           type: number
 *           description: Rating given by the user
 *         comment:
 *           type: string
 *           description: Review comment
 *         appointment_id:
 *           type: string
 *           description: Appointment ID being reviewed
 *         customer_id:
 *           type: string
 *           description: Customer (user) ID who wrote the review
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         is_deleted:
 *           type: boolean
 *           default: false
 *       required:
 *         - rating
 *         - comment
 *         - appointment_id
 *     CreateReviewDto:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           example: 5
 *         comment:
 *           type: string
 *           example: \"Excellent service\"
 *         appointment_id:
 *           type: string
 *           example: \"60f7c0b8b4d1c80015b4e8a1\"
 *       required:
 *         - rating
 *         - comment
 *         - appointment_id
 *     UpdateReviewDto:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           example: 4
 *         comment:
 *           type: string
 *           example: \"Updated comment\"
 *         appointment_id:
 *           type: string
 *           example: \"60f7c0b8b4d1c80015b4e8a1\"
 *       required:
 *         - rating
 *         - comment
 *         - appointment_id
 */