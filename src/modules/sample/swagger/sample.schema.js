/**
 * @swagger
 * components:
 *   schemas:
 *     SubmitSampleDto:
 *       type: object
 *       properties:
 *         collection_date:
 *           type: string
 *           format: date-time
 *           description: Date and time when the sample was collected (optional - if not provided, the existing collection date will be used)
 *           example: "2025-05-28T10:00:00Z"
 *
 *     ReceiveSampleDto:
 *       type: object
 *       required:
 *         - received_date
 *       properties:
 *         received_date:
 *           type: string
 *           format: date-time
 *           description: Date and time when the sample was received by the facility
 *           example: "2025-05-29T09:00:00Z"
 *
 *     SampleResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Sample ID
 *           example: "60c72b2f9b1e8b3b4c8d6e27"
 *         appointment_id:
 *           type: object
 *           description: Associated appointment
 *           properties:
 *             _id:
 *               type: string
 *               example: "60c72b2f9b1e8b3b4c8d6e24"
 *             user_id:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60c72b2f9b1e8b3b4c8d6e23"
 *                 first_name:
 *                   type: string
 *                   example: "John"
 *                 last_name:
 *                   type: string
 *                   example: "Doe"
 *             service_id:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60c72b2f9b1e8b3b4c8d6e22"
 *                 name:
 *                   type: string
 *                   example: "DNA Paternity Test"
 *         kit_id:
 *           type: object
 *           description: Associated kit
 *           properties:
 *             _id:
 *               type: string
 *               example: "60c72b2f9b1e8b3b4c8d6e26"
 *             code:
 *               type: string
 *               example: "KIT-20250527-001"
 *         type:
 *           type: string
 *           enum: [saliva, blood, hair, other]
 *           description: Type of sample
 *           example: "saliva"
 *         collection_method:
 *           type: string
 *           enum: [self, facility, home]
 *           description: Method of collection
 *           example: "self"
 *         collection_date:
 *           type: string
 *           format: date-time
 *           description: Date when sample was collected
 *           example: "2025-05-28T10:00:00Z"
 *         received_date:
 *           type: string
 *           format: date-time
 *           description: Date when sample was received by the facility
 *           example: "2025-05-29T09:00:00Z"
 *         status:
 *           type: string
 *           enum: [pending, received, testing, completed, invalid]
 *           description: Current sample status
 *           example: "pending"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *           example: "2025-05-27T09:12:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *           example: "2025-05-27T09:13:00Z"
 *
 *     AddSampleDto:
 *       type: object
 *       required:
 *         - appointment_id
 *         - type
 *       properties:
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment to add the sample to
 *           example: "60d0fe4f5311236168a109ca"
 *         kit_id:
 *           type: string
 *           description: ID of the kit to use (optional - if not provided, an available kit will be assigned)
 *           example: "60d0fe4f5311236168a109cb"
 *         type:
 *           type: string
 *           enum: [saliva, blood, hair, other]
 *           description: Type of sample
 *           example: "saliva"
 *         notes:
 *           type: string
 *           description: Additional notes about the sample
 *           example: "Morning sample"
 */ 