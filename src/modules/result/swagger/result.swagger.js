/**
 * @swagger
 * tags:
 *   name: results
 *   description: Test result management APIs
 */

/**
 * @swagger
 * /api/result:
 *   post:
 *     tags:
 *       - results
 *     summary: Create a new test result (Laboratory Technician only)
 *     description: Create a new DNA test result for a sample
 *     operationId: createResult
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResultDto'
 *     responses:
 *       201:
 *         description: Result created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultResponse'
 *       400:
 *         description: Invalid input data or sample/appointment status
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Laboratory technician access required
 *       404:
 *         description: Sample or appointment not found
 *       409:
 *         description: Result already exists for this sample
 */

/**
 * @swagger
 * /api/result/{id}:
 *   get:
 *     tags:
 *       - results
 *     summary: Get result by ID (All authenticated users)
 *     description: Retrieve detailed information about a specific test result
 *     operationId: getResultById
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *         example: "60c72b2f9b1e8b3b4c8d6e27"
 *     responses:
 *       200:
 *         description: Result details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultResponse'
 *       400:
 *         description: Invalid result ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - User cannot access this result
 *       404:
 *         description: Result not found
 *   put:
 *     tags:
 *       - results
 *     summary: Update an existing test result (Laboratory Technician only)
 *     description: Update details of an existing test result
 *     operationId: updateResult
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *         example: "60c72b2f9b1e8b3b4c8d6e27"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResultDto'
 *     responses:
 *       200:
 *         description: Result updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultResponse'
 *       400:
 *         description: Invalid input data or result ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Laboratory technician access required
 *       404:
 *         description: Result not found
 */

/**
 * @swagger
 * /api/result/sample/{sampleId}:
 *   get:
 *     tags:
 *       - results
 *     summary: Get result by sample ID (All authenticated users)
 *     description: Retrieve test result information for a specific sample
 *     operationId: getResultBySampleId
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: sampleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sample ID
 *         example: "60c72b2f9b1e8b3b4c8d6e26"
 *     responses:
 *       200:
 *         description: Result details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultResponse'
 *       400:
 *         description: Invalid sample ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - User cannot access this result
 *       404:
 *         description: Result not found for this sample
 */

/**
 * @swagger
 * /api/result/appointment/{appointmentId}:
 *   get:
 *     tags:
 *       - results
 *     summary: Get result by appointment ID (All authenticated users)
 *     description: Retrieve test result information for a specific appointment
 *     operationId: getResultByAppointmentId
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "60c72b2f9b1e8b3b4c8d6e25"
 *     responses:
 *       200:
 *         description: Result details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResultResponse'
 *       400:
 *         description: Invalid appointment ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - User cannot access this result
 *       404:
 *         description: Result not found for this appointment
 */

/**
 * @swagger
 * /api/result/sample/{sampleId}/start-testing:
 *   put:
 *     tags:
 *       - results
 *     summary: Start testing process for a sample (Laboratory Technician only)
 *     description: Update sample and appointment status to TESTING
 *     operationId: startTesting
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: sampleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sample ID
 *         example: "60c72b2f9b1e8b3b4c8d6e26"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartTestingDto'
 *     responses:
 *       200:
 *         description: Testing process started successfully
 *       400:
 *         description: Invalid input data, sample ID format, or sample status
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Laboratory technician access required
 *       404:
 *         description: Sample not found
 */ 