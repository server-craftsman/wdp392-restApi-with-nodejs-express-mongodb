/**
 * @swagger
 * components:
 *   schemas:
 *     CreateResultDto:
 *       type: object
 *       required:
 *         - sample_ids
 *         - appointment_id
 *         - customer_id
 *         - is_match
 *       properties:
 *         sample_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of the samples being tested
 *           example: ["60c72b2f9b1e8b3b4c8d6e26", "60c72b2f9b1e8b3b4c8d6e27"]
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment associated with the test
 *           example: "60c72b2f9b1e8b3b4c8d6e25"
 *         customer_id:
 *           type: string
 *           description: ID of the customer who ordered the test
 *           example: "60c72b2f9b1e8b3b4c8d6e24"
 *         is_match:
 *           type: boolean
 *           description: Whether the DNA test resulted in a match
 *           example: true
 *         result_data:
 *           type: object
 *           description: Additional result data specific to the test type
 *           example: 
 *             probability: 99.99
 *             confidence_interval: "99.9% - 100%"
 *             markers_tested: 24
 *             markers_matched: 24
 *         report_url:
 *           type: string
 *           description: URL to the detailed test report
 *           example: "https://example.com/reports/dna-test-123456.pdf"
 *
 *     UpdateResultDto:
 *       type: object
 *       properties:
 *         is_match:
 *           type: boolean
 *           description: Whether the DNA test resulted in a match
 *           example: true
 *         result_data:
 *           type: object
 *           description: Additional result data specific to the test type
 *           example: 
 *             probability: 99.99
 *             confidence_interval: "99.9% - 100%"
 *             markers_tested: 24
 *             markers_matched: 24
 *         report_url:
 *           type: string
 *           description: URL to the detailed test report
 *           example: "https://example.com/reports/dna-test-123456.pdf"
 *
 *     StartTestingDto:
 *       type: object
 *       required:
 *         - testing_start_date
 *       properties:
 *         testing_start_date:
 *           type: string
 *           format: date-time
 *           description: Date and time when the testing process started
 *           example: "2025-06-01T09:00:00Z"
 *         notes:
 *           type: string
 *           description: Optional notes about the testing process
 *           example: "Sample appears to be in good condition"
 *
 *     ResultResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Result ID
 *           example: "60c72b2f9b1e8b3b4c8d6e27"
 *         sample_ids:
 *           type: array
 *           description: Associated samples
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 example: "60c72b2f9b1e8b3b4c8d6e26"
 *               type:
 *                 type: string
 *                 example: "saliva"
 *               status:
 *                 type: string
 *                 example: "completed"
 *               person_info:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Nguyễn Văn A"
 *                   relationship:
 *                     type: string
 *                     example: "Cha giả định"
 *                   dob:
 *                     type: string
 *                     format: date-time
 *                     example: "1978-04-19T00:00:00Z"
 *         customer_id:
 *           type: object
 *           description: Customer who ordered the test
 *           properties:
 *             _id:
 *               type: string
 *               example: "60c72b2f9b1e8b3b4c8d6e24"
 *             first_name:
 *               type: string
 *               example: "John"
 *             last_name:
 *               type: string
 *               example: "Doe"
 *         appointment_id:
 *           type: object
 *           description: Associated appointment
 *           properties:
 *             _id:
 *               type: string
 *               example: "60c72b2f9b1e8b3b4c8d6e25"
 *             status:
 *               type: string
 *               example: "completed"
 *         laboratory_technician_id:
 *           type: object
 *           description: Laboratory technician who performed the test
 *           properties:
 *             _id:
 *               type: string
 *               example: "60c72b2f9b1e8b3b4c8d6e28"
 *             first_name:
 *               type: string
 *               example: "Jane"
 *             last_name:
 *               type: string
 *               example: "Smith"
 *         is_match:
 *           type: boolean
 *           description: Whether the DNA test resulted in a match
 *           example: true
 *         result_data:
 *           type: object
 *           description: Additional result data specific to the test type
 *           example: 
 *             probability: 99.99
 *             confidence_interval: "99.9% - 100%"
 *             markers_tested: 24
 *             markers_matched: 24
 *         report_url:
 *           type: string
 *           description: URL to the detailed test report
 *           example: "https://example.com/reports/dna-test-123456.pdf"
 *         completed_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the test was completed
 *           example: "2025-06-03T14:30:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *           example: "2025-06-01T09:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *           example: "2025-06-03T14:30:00Z"
 */ 