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
 *         - sample_ids
 *         - appointment_id
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
 *           description: ID of the appointment
 *           example: 5f8d0e0e9d3b9a0017c1a7a2
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
 *         sample_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of the samples
 *           example: ["60c72b2f9b1e8b3b4c8d6e26", "60c72b2f9b1e8b3b4c8d6e27"]
 *         appointment_id:
 *           type: string
 *           description: ID of the appointment
 *         customer_id:
 *           type: string
 *           description: ID of the customer
 *         laboratory_technician_id:
 *           type: string
 *           description: ID of the laboratory technician who performed the test
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
 *         - testing_start_date
 *       properties:
 *         testing_start_date:
 *           type: string
 *           format: date-time
 *           description: Date when the testing process started
 *           example: "2023-10-25T10:00:00.000Z"
 *         notes:
 *           type: string
 *           description: Notes about the testing process
 *           example: "Starting DNA testing process"
 *         sample_ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of sample IDs to start testing (for batch processing)
 *           example: ["60c72b2f9b1e8b3b4c8d6e26", "60c72b2f9b1e8b3b4c8d6e27"]
 */

/**
 * @swagger
 * /api/result:
 *   post:
 *     summary: Create a new test result (Lab only)
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
 * /api/result/{id}:
 *   get:
 *     summary: Get result by ID (All authenticated users)
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
 *     summary: Update a test result (Lab only)
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
 * /api/result/sample/start-testing:
 *   post:
 *     summary: Start testing process for multiple samples (batch processing) (Lab only)
 *     description: >
 *       Mark multiple samples as being tested in a single request. 
 *       Updates each sample status to TESTING and their associated appointment statuses to TESTING.
 *       Only laboratory technicians can start testing.
 *     tags:
 *       - results
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartTesting'
 *     responses:
 *       200:
 *         description: Testing process started for multiple samples
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
 *                   example: Testing process started for 2 samples, 0 failed
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Sample ID
 *                         example: 60c72b2f9b1e8b3b4c8d6e26
 *                       success:
 *                         type: boolean
 *                         description: Whether testing started successfully for this sample
 *                         example: true
 *                       error:
 *                         type: string
 *                         description: Error message if testing failed for this sample
 *                         example: Sample not found
 *       400:
 *         description: No sample IDs provided or invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, only laboratory technicians can start testing
 * 
 * /api/result/sample/{sampleId}:
 *   get:
 *     summary: Get result by sample ID (All authenticated users)
 *     description: Get a test result by its associated sample ID. Searches for the sample ID in the sample_ids array. Includes PDF report URL.
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
 * /api/result/appointment/{appointmentId}:
 *   get:
 *     summary: Get result by appointment ID (All authenticated users)
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