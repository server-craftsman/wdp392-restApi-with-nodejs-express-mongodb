/**
 * @swagger
 * tags:
 *   - name: Result
 *     description: Test result management endpoints
 */

/**
 * @swagger
 * /api/result/create:
 *   post:
 *     tags:
 *       - Result
 *     summary: Create a new test result
 *     description: Creates a new test result for a sample and updates its status. Appointment must be PAID before creating results.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResultDto'
 *     responses:
 *       '200':
 *         description: Result created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Result'
 *                 message:
 *                   type: string
 *                   example: "Result created successfully"
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
 *       '404':
 *         description: Sample or appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: Result already exists for this sample
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
 * /api/result/{id}:
 *   get:
 *     tags:
 *       - Result
 *     summary: Get result by ID
 *     description: Retrieves a test result by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the result to get
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Result'
 *                 message:
 *                   type: string
 *                   example: "Result retrieved successfully"
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
 *       '404':
 *         description: Result not found
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
 * /api/result/sample/{sampleId}:
 *   get:
 *     tags:
 *       - Result
 *     summary: Get result by sample ID
 *     description: Retrieves a test result by sample ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sampleId
 *         in: path
 *         required: true
 *         description: ID of the sample to get result for
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Result'
 *                 message:
 *                   type: string
 *                   example: "Result retrieved successfully"
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
 *       '404':
 *         description: Result not found
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
 * /api/result/start-testing/{sampleId}:
 *   post:
 *     tags:
 *       - Result
 *     summary: Start testing process for a sample
 *     description: Updates the sample status to TESTING and the appointment status to TESTING. Appointment must be PAID before starting testing.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sampleId
 *         in: path
 *         required: true
 *         description: ID of the sample to start testing for
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartTestingDto'
 *     responses:
 *       '200':
 *         description: Testing started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Testing started successfully"
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
 *       '404':
 *         description: Sample not found
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
 * components:
 *   schemas:
 *     CreateResultDto:
 *       type: object
 *       properties:
 *         sample_id:
 *           type: string
 *           description: ID of the sample this result is for
 *           example: "5f8d0e0e9d3b9a0017c1a7a1"
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment this result is for
 *           example: "5f8d0e0e9d3b9a0017c1a7a2"
 *         customer_id:
 *           type: string
 *           description: ID of the customer this result is for
 *           example: "5f8d0e0e9d3b9a0017c1a7a3"
 *         is_match:
 *           type: boolean
 *           description: Whether the test result is a match or not
 *           example: true
 *         result_data:
 *           type: object
 *           description: Additional result data specific to the test type
 *           example: {"dna_match_percentage": 99.99, "confidence_level": "high"}
 *         report_url:
 *           type: string
 *           description: URL to the detailed result report
 *           example: "https://example.com/reports/result_12345.pdf"
 *       required:
 *         - sample_id
 *         - appointment_id
 *         - customer_id
 *         - is_match
 * 
 *     StartTestingDto:
 *       type: object
 *       properties:
 *         notes:
 *           type: string
 *           description: Additional notes for the testing process
 *           example: "Sample appears to be in good condition"
 *
 *     Result:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a4"
 *         sample_id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a1"
 *         appointment_id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a2"
 *         customer_id:
 *           type: string
 *           example: "5f8d0e0e9d3b9a0017c1a7a3"
 *         is_match:
 *           type: boolean
 *           example: true
 *         result_data:
 *           type: object
 *           example: {"dna_match_percentage": 99.99, "confidence_level": "high"}
 *         report_url:
 *           type: string
 *           example: "https://example.com/reports/result_12345.pdf"
 *         completed_at:
 *           type: string
 *           format: date-time
 *           example: "2023-07-15T14:30:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2023-07-15T14:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2023-07-15T14:30:00Z"
 */ 