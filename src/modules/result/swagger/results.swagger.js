/**
 * @swagger
 * components:
 *   schemas:
 *     ResultData:
 *       type: object
 *       properties:
 *         probability:
 *           type: number
 *           description: Probability of match in percentage
 *           example: 99.99
 *         confidence_interval:
 *           type: string
 *           description: Confidence interval for the result
 *           example: "99.9% - 100%"
 *         markers_tested:
 *           type: number
 *           description: Number of markers tested
 *           example: 24
 *         markers_matched:
 *           type: number
 *           description: Number of markers that matched
 *           example: 24
 *         dna_match_percentage:
 *           type: number
 *           description: DNA match percentage
 *           example: 99.99
 *         confidence_level:
 *           type: string
 *           description: Confidence level classification
 *           example: "high"
 *     
 *     CreateResult:
 *       type: object
 *       required:
 *         - sample_id
 *         - appointment_id
 *         - customer_id
 *         - is_match
 *       properties:
 *         sample_id:
 *           type: string
 *           description: ID of the sample
 *           example: 5f8d0e0e9d3b9a0017c1a7a1
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment
 *           example: 5f8d0e0e9d3b9a0017c1a7a2
 *         customer_id:
 *           type: string
 *           description: ID of the customer
 *           example: 5f8d0e0e9d3b9a0017c1a7a3
 *         is_match:
 *           type: boolean
 *           description: Whether the test result is a match
 *           example: true
 *         result_data:
 *           $ref: '#/components/schemas/ResultData'
 *       description: >
 *         Create a new test result. 
 *         A PDF report will be automatically generated and the report_url field will be populated.
 *         The PDF will include customer information, sample details, and test results.
 * 
 *     UpdateResult:
 *       type: object
 *       properties:
 *         is_match:
 *           type: boolean
 *           description: Whether the test result is a match
 *           example: true
 *         result_data:
 *           $ref: '#/components/schemas/ResultData'
 *       description: >
 *         Update a test result. 
 *         If is_match or result_data is changed, a new PDF report will be generated automatically.
 * 
 *     Result:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Result ID
 *         sample_id:
 *           type: string
 *           description: ID of the sample
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment
 *         customer_id:
 *           type: string
 *           description: ID of the customer
 *         is_match:
 *           type: boolean
 *           description: Whether the test result is a match
 *         result_data:
 *           $ref: '#/components/schemas/ResultData'
 *         report_url:
 *           type: string
 *           description: URL to the PDF report of the test result
 *           example: https://medical-test-results.s3.us-east-1.amazonaws.com/test-results/5f8d0e0e9d3b9a0017c1a7a3/5f8d0e0e9d3b9a0017c1a7a4-20231025.pdf
 *         completed_at:
 *           type: string
 *           format: date-time
 *           description: When the test was completed
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the result was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the result was last updated
 * 
 *     StartTesting:
 *       type: object
 *       required:
 *         - notes
 *       properties:
 *         notes:
 *           type: string
 *           description: Notes about the testing process
 *           example: "Starting DNA testing process"
 */

/**
 * @swagger
 * /api/result:
 *   post:
 *     summary: Create a new test result
 *     description: >
 *       Create a new test result with automatic PDF report generation.
 *       The report will include detailed information about the test and results.
 *       Only laboratory technicians can create test results.
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResult'
 *     responses:
 *       201:
 *         description: Result created successfully, PDF generation started
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
 *                   example: Result created successfully. PDF report will be generated and available shortly.
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, only laboratory technicians can create results
 * 
 * /api/results/{id}:
 *   get:
 *     summary: Get result by ID
 *     description: Get a test result by its ID. Includes PDF report URL.
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     responses:
 *       200:
 *         description: Success
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
 *       404:
 *         description: Result not found
 * 
 *   put:
 *     summary: Update a test result
 *     description: >
 *       Update a test result. If the is_match or result_data fields are changed,
 *       a new PDF report will be automatically generated.
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResult'
 *     responses:
 *       200:
 *         description: Result updated successfully
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
 *                   example: Result updated successfully. If test data was changed, a new PDF report will be generated.
 *       404:
 *         description: Result not found
 * 
 * /api/samples/{sampleId}/start-testing:
 *   post:
 *     summary: Start testing process for a sample
 *     description: Mark a sample as being tested. Only laboratory technicians can start testing.
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: sampleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sample ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartTesting'
 *     responses:
 *       200:
 *         description: Testing process started successfully
 *       404:
 *         description: Sample not found
 *       400:
 *         description: Invalid sample status
 * 
 * /api/results/sample/{sampleId}:
 *   get:
 *     summary: Get result by sample ID
 *     description: Get a test result by its associated sample ID. Includes PDF report URL.
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: sampleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sample ID
 *     responses:
 *       200:
 *         description: Success
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
 *       404:
 *         description: Result not found for this sample
 * 
 * /api/results/appointment/{appointmentId}:
 *   get:
 *     summary: Get result by appointment ID
 *     description: Get a test result by its associated appointment ID. Includes PDF report URL.
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Success
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
 *       404:
 *         description: Result not found for this appointment
 */ 