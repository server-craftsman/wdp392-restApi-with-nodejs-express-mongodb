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
 * /api/sample/appointment/{appointmentId}:
 *   get:
 *     tags:
 *       - samples
 *     summary: Get samples by appointment ID (All authenticated users)
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

/**
 * @swagger
 * /api/sample/add-to-appointment:
 *   post:
 *     tags:
 *       - samples
 *     summary: Add samples with multiple person information (Customer only or Other Authenticated Users)
 *     description: Add samples to an existing appointment where each sample type corresponds to a specific person_info entry
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
 *               - person_info_list
 *             properties:
 *               appointment_id:
 *                 type: string
 *                 description: ID of the appointment to add samples to
 *                 example: "60d0fe4f5311236168a109ca"
 *               kit_id:
 *                 type: string
 *                 description: ID of the kit to use for the first sample (optional - if not provided, an available kit will be assigned)
 *                 example: "60d0fe4f5311236168a109cb"
 *               sample_types:
 *                 type: array
 *                 description: Types of samples to add (must provide at least two)
 *                 items:
 *                   type: string
 *                   enum: [saliva, blood, hair, other]
 *                 example: ["saliva", "saliva"]
 *               notes:
 *                 type: string
 *                 description: Additional notes about the samples
 *                 example: "Morning samples"
 *               person_info_list:
 *                 type: array
 *                 description: List of person information corresponding to each sample type (must match the length of sample_types)
 *                 items:
 *                   $ref: '#/components/schemas/PersonInfoDto'
 *                 example: [
 *                   {
 *                     "name": "Nguyễn Văn A",
 *                     "dob": "1978-04-19T00:00:00Z",
 *                     "relationship": "Cha giả định",
 *                     "birth_place": "Thanh An",
 *                     "nationality": "Hà Lan",
 *                     "identity_document": "NX2JHP9F9"
 *                   },
 *                   {
 *                     "name": "Nguyễn Văn B",
 *                     "dob": "2010-03-15T00:00:00Z",
 *                     "relationship": "Con giả định",
 *                     "birth_place": "Hà Nội",
 *                     "nationality": "Việt Nam",
 *                     "identity_document": "CH7382HF2"
 *                   }
 *                 ]
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
 *                     $ref: '#/components/schemas/SampleResponse'
 *       400:
 *         description: Bad request - Invalid input data, not enough available kits, or mismatched sample_types and person_info_list lengths
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized to add samples to this appointment
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sample/batch-submit:
 *   post:
 *     tags:
 *       - samples
 *     summary: Submit multiple samples at once (Customer only)
 *     description: Customer submits multiple samples in a single request
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchSubmitSamplesDto'
 *     responses:
 *       200:
 *         description: Samples submitted successfully
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
 *         description: Bad request - Invalid input data or sample status
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Customer access required or not your samples
 *       404:
 *         description: One or more samples not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sample/batch-receive:
 *   post:
 *     tags:
 *       - samples
 *     summary: Receive multiple samples at once (Staff only)
 *     description: Staff confirms receipt of multiple samples in a single request
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchReceiveSamplesDto'
 *     responses:
 *       200:
 *         description: Samples received successfully
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
 *         description: Bad request - Invalid input data or sample status
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Staff access required
 *       404:
 *         description: One or more samples not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sample/upload-person-image:
 *   post:
 *     tags:
 *       - samples
 *     summary: Upload a person's image (Customer only)
 *     description: Upload an image for a person associated with a sample
 *     security:
 *       - Bearer: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - sample_id
 *               - image
 *             properties:
 *               sample_id:
 *                 type: string
 *                 description: ID of the sample
 *                 example: "60c72b2f9b1e8b3b4c8d6e27"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (jpg, jpeg, png, gif)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sample:
 *                       $ref: '#/components/schemas/SampleResponse'
 *                     image_url:
 *                       type: string
 *                       description: URL of the uploaded image
 *                       example: "https://dna-test-samples.s3.ap-southeast-1.amazonaws.com/sample/60c72b2f9b1e8b3b4c8d6e27/1234567890.jpg"
 *       400:
 *         description: Bad request - Invalid input data or no file uploaded
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - User not authorized to update this sample
 *       404:
 *         description: Sample not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sample/testing/ready:
 *   get:
 *     summary: Get samples ready for testing (Lab only)
 *     description: Retrieve samples with RECEIVED status that are ready for laboratory testing. Only accessible by laboratory technicians.
 *     tags:
 *       - samples
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of samples ready for testing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     pageData:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sample'
 *                     pageInfo:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 25
 *                         pageNum:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *       403:
 *         description: Forbidden - Only laboratory technicians can access this endpoint
 *       500:
 *         description: Internal server error
 * 
 * /api/sample/testing/all:
 *   get:
 *     summary: Get all samples with TESTING status (Lab only)
 *     description: Retrieve all samples with TESTING status that are ready for laboratory testing, with pagination. Only accessible by laboratory technicians.
 *     tags:
 *       - samples
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of all samples with TESTING status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     pageData:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sample'
 *                     pageInfo:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 25
 *                         pageNum:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *       403:
 *         description: Forbidden - Only laboratory technicians can access this endpoint
 *       500:
 *         description: Internal server error
 * 
 * /api/sample/search:
 *   get:
 *     summary: Search samples by various criteria (Lab, Staff only)
 *     description: Search for samples using different filters. Accessible by laboratory technicians and staff.
 *     tags:
 *       - samples
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, received, testing, completed, invalid]
 *         description: Filter by sample status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [saliva, blood, hair, other]
 *         description: Filter by sample type
 *       - in: query
 *         name: appointmentId
 *         schema:
 *           type: string
 *         description: Filter by appointment ID
 *       - in: query
 *         name: kitCode
 *         schema:
 *           type: string
 *         description: Filter by kit code
 *       - in: query
 *         name: personName
 *         schema:
 *           type: string
 *         description: Filter by person name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of samples matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     pageData:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sample'
 *                     pageInfo:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 25
 *                         pageNum:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *       403:
 *         description: Forbidden - Only laboratory technicians and staff can access this endpoint
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/sample/collect:
 *   post:
 *     tags: [samples]
 *     summary: Collect sample at facility (Staff only)
 *     description: Staff collects a sample at the medical facility and records the information
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
 *               - type
 *               - person_info
 *             properties:
 *               appointment_id:
 *                 type: string
 *                 description: ID of the appointment
 *                 example: "60d21b4667d0d8992e610c85"
 *               type:
 *                 type: array
 *                 description: Types of samples collected
 *                 items:
 *                   type: string
 *                   enum: [blood, saliva, hair, other]
 *                 example: ["blood", "saliva"]
 *               person_info:
 *                 type: array
 *                 description: Information about the persons from whom samples were collected
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Full name of the person
 *                       example: "Thích Tâm Phúc"
 *                     dob:
 *                       type: string
 *                       format: date
 *                       description: Date of birth
 *                       example: "1983-03-08"
 *                     relationship:
 *                       type: string
 *                       description: Relationship to the primary patient
 *                       example: "Self"
 *                     gender:
 *                       type: string
 *                       description: Gender of the person
 *                       example: "Male"
 *                     phone_number:
 *                       type: string
 *                       description: Phone number of the person
 *                       example: "0909090909"
 *                     birth_place:
 *                       type: string
 *                       description: Birth place of the person
 *                       example: "Vietnam"
 *                     nationality:
 *                       type: string
 *                       description: Nationality of the person
 *                       example: "Vietnamese"
 *                     identity_document:
 *                       type: string
 *                       description: ID document number
 *                       example: "1234567890"
 *                 example:
 *                   - name: "Thích Tâm Phúc"
 *                     dob: "1983-03-08"
 *                     relationship: "Self"
 *                     gender: "Male"
 *                     phone_number: "0909090909"
 *                     birth_place: "Vietnam"
 *                     nationality: "Vietnamese"
 *                     identity_document: "1234567890"
 *                   - name: "Nguyễn Đan Huy"
 *                     dob: "2003-10-15"
 *                     relationship: "Self"
 *                     gender: "Male"
 *                     phone_number: "0909090909"
 *                     birth_place: "Vietnam"
 *                     nationality: "Vietnamese"
 *                     identity_document: "1234567890"
 *     responses:
 *       201:
 *         description: Sample collected successfully
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
 *                   example: Sample collected successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c86"
 *                       appointment_id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       type:
 *                         type: string
 *                         example: "BLOOD"
 *                       collection_method:
 *                         type: string
 *                         example: "FACILITY"
 *                       collection_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-06-15T10:30:00Z"
 *                       status:
 *                         type: string
 *                         example: "PENDING"
 *                       person_info:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           dob:
 *                             type: string
 *                             format: date
 *                             example: "1990-01-15"
 *                           relationship:
 *                             type: string
 *                             example: "Self"
 *       400:
 *         description: Bad request
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
 *                   example: Appointment must be confirmed before collecting sample
 *       401:
 *         description: Unauthorized
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
 *                   example: Staff not authenticated
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
 *                   example: Appointment not found
 */ 