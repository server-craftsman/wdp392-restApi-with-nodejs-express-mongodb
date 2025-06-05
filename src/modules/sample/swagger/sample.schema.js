/**
 * @swagger
 * components:
 *   schemas:
 *     PersonInfoDto:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the person
 *           example: "Nguyễn Văn A"
 *         dob:
 *           type: string
 *           format: date-time
 *           description: Date of birth
 *           example: "1978-04-19T00:00:00Z"
 *         relationship:
 *           type: string
 *           description: Relationship to the test subject
 *           example: "Cha giả định"
 *         birth_place:
 *           type: string
 *           description: Place of birth
 *           example: "Thanh An"
 *         nationality:
 *           type: string
 *           description: Nationality
 *           example: "Hà Lan"
 *         identity_document:
 *           type: string
 *           description: Identity document number (ID card, passport, etc.)
 *           example: "NX2JHP9F9"
 *         image_url:
 *           type: string
 *           description: URL to the person's image
 *           example: "https://dna-test-samples.s3.ap-southeast-1.amazonaws.com/sample/60c72b2f9b1e8b3b4c8d6e27/1234567890.jpg"
 *
 *     UploadPersonImageDto:
 *       type: object
 *       required:
 *         - sample_id
 *       properties:
 *         sample_id:
 *           type: string
 *           description: ID of the sample
 *           example: "60c72b2f9b1e8b3b4c8d6e27"
 *
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
 *     BatchSubmitSamplesDto:
 *       type: object
 *       required:
 *         - sample_ids
 *       properties:
 *         sample_ids:
 *           type: array
 *           description: Array of sample IDs to submit
 *           items:
 *             type: string
 *           example: ["60c72b2f9b1e8b3b4c8d6e27", "60c72b2f9b1e8b3b4c8d6e28"]
 *         collection_date:
 *           type: string
 *           format: date-time
 *           description: Date and time when the samples were collected (optional - if not provided, the existing collection dates will be used)
 *           example: "2025-05-28T10:00:00Z"
 *
 *     BatchReceiveSamplesDto:
 *       type: object
 *       required:
 *         - sample_ids
 *         - received_date
 *       properties:
 *         sample_ids:
 *           type: array
 *           description: Array of sample IDs to receive
 *           items:
 *             type: string
 *           example: ["60c72b2f9b1e8b3b4c8d6e27", "60c72b2f9b1e8b3b4c8d6e28"]
 *         received_date:
 *           type: string
 *           format: date-time
 *           description: Date and time when the samples were received by the facility
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
 *         person_info:
 *           $ref: '#/components/schemas/PersonInfoDto'
 *         person_info_list:
 *           type: array
 *           description: List of person information associated with each sample type
 *           items:
 *             $ref: '#/components/schemas/PersonInfoDto'
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
 *         - sample_types
 *       properties:
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment to add the sample to
 *           example: "60d0fe4f5311236168a109ca"
 *         kit_id:
 *           type: string
 *           description: ID of the kit to use (optional - if not provided, an available kit will be assigned)
 *           example: "60d0fe4f5311236168a109cb"
 *         sample_types:
 *           type: array
 *           description: Types of samples to add (must provide at least two)
 *           items:
 *             type: string
 *             enum: [saliva, blood, hair, other]
 *           example: ["saliva", "saliva"]
 *         notes:
 *           type: string
 *           description: Additional notes about the sample
 *           example: "Morning sample"
 *         person_info:
 *           $ref: '#/components/schemas/PersonInfoDto'
 *         person_info_list:
 *           type: array
 *           description: List of person information corresponding to each sample type
 *           items:
 *             $ref: '#/components/schemas/PersonInfoDto'
 *
 *     PersonInfo:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the person
 *         gender:
 *           type: string
 *           description: Gender of the person
 *         phone_number:
 *           type: string
 *           description: Phone number of the person
 *         dob:
 *           type: string
 *           format: date
 *           description: Date of birth
 *         relationship:
 *           type: string
 *           description: Relationship to the patient
 *         birth_place:
 *           type: string
 *           description: Place of birth
 *         nationality:
 *           type: string
 *           description: Nationality
 *         identity_document:
 *           type: string
 *           description: Identity document number
 *
 *     CollectSampleRequest:
 *       type: object
 *       required:
 *         - appointment_id
 *         - type
 *         - collection_date
 *         - person_info
 *       properties:
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment
 *         type:
 *           type: array
 *           items:
 *             type: string
 *             enum: [SALIVA, BLOOD, HAIR, OTHER]
 *           description: Types of samples to collect
 *         collection_date:
 *           type: string
 *           format: date-time
 *           description: Date and time of sample collection
 *         person_info:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PersonInfo'
 *           description: Information for each person providing a sample
 *
 *     CollectSampleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Samples collected successfully
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Sample ID
 *               appointment_id:
 *                 type: string
 *                 description: ID of the appointment
 *               type:
 *                 type: string
 *                 enum: [SALIVA, BLOOD, HAIR, OTHER]
 *                 description: Type of sample
 *               collection_method:
 *                 type: string
 *                 enum: [FACILITY]
 *                 description: Method of collection
 *               collection_date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of collection
 *               status:
 *                 type: string
 *                 enum: [PENDING]
 *                 description: Status of the sample
 *               person_info:
 *                 $ref: '#/components/schemas/PersonInfo'
 *               created_at:
 *                 type: string
 *                 format: date-time
 *                 description: Creation timestamp
 *               updated_at:
 *                 type: string
 *                 format: date-time
 *                 description: Last update timestamp
 */ 