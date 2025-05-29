/**
 * @swagger
 * components:
 *   schemas:
 *     CreateRegistrationFormDto:
 *       type: object
 *       required:
 *         - sample_id
 *         - patient_name
 *         - gender
 *         - sample_type
 *         - relationship
 *         - collection_date
 *       properties:
 *         sample_id:
 *           type: string
 *           description: ID of the sample associated with this registration form
 *           example: "60c72b2f9b1e8b3b4c8d6e26"
 *         patient_name:
 *           type: string
 *           description: Name of the patient
 *           example: "John Doe"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Gender of the patient
 *           example: "male"
 *         phone_number:
 *           type: string
 *           description: Phone number of the patient
 *           example: "0123456789"
 *         email:
 *           type: string
 *           description: Email of the patient
 *           example: "john.doe@example.com"
 *         sample_type:
 *           type: string
 *           enum: [saliva, blood, hair, other]
 *           description: Type of sample collected
 *           example: "saliva"
 *         relationship:
 *           type: string
 *           description: Relationship to the test subject
 *           example: "father"
 *         collection_date:
 *           type: string
 *           format: date-time
 *           description: Date when the sample was collected
 *           example: "2025-05-28T10:00:00Z"
 *
 *     UpdateRegistrationFormDto:
 *       type: object
 *       properties:
 *         patient_name:
 *           type: string
 *           description: Name of the patient
 *           example: "John Doe"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Gender of the patient
 *           example: "male"
 *         phone_number:
 *           type: string
 *           description: Phone number of the patient
 *           example: "0123456789"
 *         email:
 *           type: string
 *           description: Email of the patient
 *           example: "john.doe@example.com"
 *         sample_type:
 *           type: string
 *           enum: [saliva, blood, hair, other]
 *           description: Type of sample collected
 *           example: "saliva"
 *         relationship:
 *           type: string
 *           description: Relationship to the test subject
 *           example: "father"
 *         collection_date:
 *           type: string
 *           format: date-time
 *           description: Date when the sample was collected
 *           example: "2025-05-28T10:00:00Z"
 *
 *     RegistrationFormResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Registration Form ID
 *           example: "60c72b2f9b1e8b3b4c8d6e27"
 *         sample_id:
 *           type: object
 *           description: Associated sample
 *           properties:
 *             _id:
 *               type: string
 *               example: "60c72b2f9b1e8b3b4c8d6e26"
 *             type:
 *               type: string
 *               example: "saliva"
 *             status:
 *               type: string
 *               example: "received"
 *         patient_name:
 *           type: string
 *           description: Name of the patient
 *           example: "John Doe"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Gender of the patient
 *           example: "male"
 *         phone_number:
 *           type: string
 *           description: Phone number of the patient
 *           example: "0123456789"
 *         email:
 *           type: string
 *           description: Email of the patient
 *           example: "john.doe@example.com"
 *         sample_type:
 *           type: string
 *           enum: [saliva, blood, hair, other]
 *           description: Type of sample collected
 *           example: "saliva"
 *         relationship:
 *           type: string
 *           description: Relationship to the test subject
 *           example: "father"
 *         collection_date:
 *           type: string
 *           format: date-time
 *           description: Date when the sample was collected
 *           example: "2025-05-28T10:00:00Z"
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
 */ 