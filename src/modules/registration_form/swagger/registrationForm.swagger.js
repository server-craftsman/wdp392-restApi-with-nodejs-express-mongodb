/**
 * @swagger
 * tags:
 *   name: registration-forms
 *   description: Registration Form management APIs
 */

/**
 * @swagger
 * /api/registration-form:
 *   post:
 *     tags:
 *       - registration-forms
 *     summary: Create a new registration form (Laboratory Technician only)
 *     description: Create a new registration form for a sample
 *     operationId: createRegistrationForm
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRegistrationFormDto'
 *     responses:
 *       201:
 *         description: Registration form created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationFormResponse'
 *       400:
 *         description: Invalid input data or sample ID
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Laboratory technician access required
 *       404:
 *         description: Sample not found
 *       409:
 *         description: Registration form already exists for this sample
 *   get:
 *     tags:
 *       - registration-forms
 *     summary: Get all registration forms with pagination (Staff, Laboratory Technician, Manager, Admin)
 *     description: Retrieve a paginated list of registration forms
 *     operationId: getAllRegistrationForms
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Registration forms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 forms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RegistrationFormResponse'
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Staff, Laboratory technician, Manager, or Admin access required
 */

/**
 * @swagger
 * /api/registration-form/{id}:
 *   get:
 *     tags:
 *       - registration-forms
 *     summary: Get registration form by ID (Staff, Laboratory Technician, Manager, Admin)
 *     description: Retrieve detailed information about a specific registration form
 *     operationId: getRegistrationFormById
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration Form ID
 *         example: "60c72b2f9b1e8b3b4c8d6e27"
 *     responses:
 *       200:
 *         description: Registration form details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationFormResponse'
 *       400:
 *         description: Invalid registration form ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Staff, Laboratory technician, Manager, or Admin access required
 *       404:
 *         description: Registration form not found
 *   put:
 *     tags:
 *       - registration-forms
 *     summary: Update an existing registration form (Laboratory Technician only)
 *     description: Update details of an existing registration form
 *     operationId: updateRegistrationForm
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration Form ID
 *         example: "60c72b2f9b1e8b3b4c8d6e27"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRegistrationFormDto'
 *     responses:
 *       200:
 *         description: Registration form updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationFormResponse'
 *       400:
 *         description: Invalid input data or registration form ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Laboratory technician access required
 *       404:
 *         description: Registration form not found
 */

/**
 * @swagger
 * /api/registration-form/sample/{sampleId}:
 *   get:
 *     tags:
 *       - registration-forms
 *     summary: Get registration form by sample ID (Staff, Laboratory Technician, Manager, Admin)
 *     description: Retrieve registration form information for a specific sample
 *     operationId: getRegistrationFormBySampleId
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
 *         description: Registration form details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationFormResponse'
 *       400:
 *         description: Invalid sample ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Staff, Laboratory technician, Manager, or Admin access required
 *       404:
 *         description: Registration form not found for this sample
 */ 