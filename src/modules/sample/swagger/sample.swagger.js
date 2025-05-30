/**
 * @swagger
 * /api/sample/add-to-appointment:
 *   post:
 *     tags:
 *       - samples
 *     summary: Add samples to an existing appointment
 *     description: Add samples to an existing appointment with automatic kit assignment
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointment_id
 *               - sample_types
 *             properties:
 *               appointment_id:
 *                 type: string
 *                 description: ID of the appointment to add samples to
 *               kit_id:
 *                 type: string
 *                 description: Optional - ID of a specific kit to use for the first sample. If not provided, system will automatically assign available kits.
 *               sample_types:
 *                 type: array
 *                 description: Types of samples to add
 *                 items:
 *                   type: string
 *                   enum: [BLOOD, SALIVA, HAIR, OTHER]
 *               notes:
 *                 type: string
 *                 description: Optional notes about the sample
 *     responses:
 *       201:
 *         description: Samples added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sample'
 *       400:
 *         description: Bad request - Invalid input data or not enough available kits
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized to add samples to this appointment
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sample/{id}:
 *   get:
 *     tags:
 *       - samples
 *     summary: Get sample by ID (All authenticated users)
 *     description: Retrieve detailed information about a specific sample
 *     operationId: getSampleById
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sample ID
 *         example: "60c72b2f9b1e8b3b4c8d6e27"
 *     responses:
 *       200:
 *         description: Sample details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SampleResponse'
 *       400:
 *         description: Invalid sample ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid sample ID"
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       403:
 *         description: Forbidden - User cannot access this sample
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to access this sample"
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *       404:
 *         description: Sample not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Sample not found"
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 */

/**
 * @swagger
 * /api/sample/{id}/submit:
 *   put:
 *     tags:
 *       - samples
 *     summary: Submit a sample (Customer only)
 *     description: Customer confirms that they have collected the sample and submitted it to the facility
 *     operationId: submitSample
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sample ID
 *         example: "60c72b2f9b1e8b3b4c8d6e27"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitSampleDto'
 *     responses:
 *       200:
 *         description: Sample submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SampleResponse'
 *       400:
 *         description: Invalid input data, sample ID format, or sample status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid sample ID or sample already submitted"
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       403:
 *         description: Forbidden - Customer access required or not your sample
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to submit this sample"
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *       404:
 *         description: Sample not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Sample not found"
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 */

/**
 * @swagger
 * /api/sample/{id}/receive:
 *   put:
 *     tags:
 *       - samples
 *     summary: Receive a sample (Staff only)
 *     description: Staff confirms that they have received the sample from the customer
 *     operationId: receiveSample
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sample ID
 *         example: "60c72b2f9b1e8b3b4c8d6e27"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReceiveSampleDto'
 *     responses:
 *       200:
 *         description: Sample received successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SampleResponse'
 *       400:
 *         description: Invalid input data, sample ID format, or sample status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid sample ID or sample not in correct state"
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       403:
 *         description: Forbidden - Staff access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Only staff can receive samples"
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *       404:
 *         description: Sample not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Sample not found"
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 */

/**
 * @swagger
 * /api/sample/appointment/{appointmentId}:
 *   get:
 *     tags:
 *       - samples
 *     summary: Get samples by appointment ID
 *     description: Retrieve all samples associated with a specific appointment
 *     operationId: getSamplesByAppointmentId
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *         example: "60d0fe4f5311236168a109ce"
 *     responses:
 *       200:
 *         description: Samples retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SampleResponse'
 *       400:
 *         description: Invalid appointment ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid appointment ID"
 *                 error:
 *                   type: string
 *                   example: "Bad Request"
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *       404:
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Appointment not found"
 *                 error:
 *                   type: string
 *                   example: "Not Found"
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 */ 