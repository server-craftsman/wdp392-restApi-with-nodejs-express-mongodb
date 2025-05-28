/**
 * @swagger
 * tags:
 *   name: kits
 *   description: Kit management APIs
 */

/**
 * @swagger
 * /api/kit/create:
 *   post:
 *     tags:
 *       - kits
 *     summary: Create a new kit (Admin, Manager only)
 *     description: Create a new kit with auto-generated code or specified code
 *     operationId: createKit
 *     security:
 *       - Bearer: []
 *     responses:
 *       201:
 *         description: Kit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KitResponse'
 *       400:
 *         description: Invalid input or malformed kit code
 *       401:
 *         description: Unauthorized - Admin or Manager access required
 *       409:
 *         description: Kit code already exists
 */

/**
 * @swagger
 * /api/kit/search:
 *   get:
 *     tags:
 *       - kits
 *     summary: Search kits (Admin, Manager, Staff, Laboratory Technician only)
 *     description: Search for kits with pagination and filtering options
 *     operationId: searchKits
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Filter by kit code (full or partial)
 *         example: "KIT-20230615"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, assigned, used, returned, damaged]
 *         description: Filter by kit status
 *         example: "available"
 *       - in: query
 *         name: appointment_id
 *         schema:
 *           type: string
 *         description: Filter by appointment ID
 *         example: "60d5ec9af682fbd12a0f4d4d"
 *       - in: query
 *         name: assigned_to_user_id
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *         example: "60d5ec9af682fbd12a0f4a1a"
 *     responses:
 *       200:
 *         description: List of kits with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KitPaginationResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

/**
 * @swagger
 * /api/kit/available:
 *   get:
 *     tags:
 *       - kits
 *     summary: Get available kits (Admin, Manager, Staff, Laboratory Technician only)
 *     description: Retrieve all kits with 'available' status
 *     operationId: getAvailableKits
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: List of available kits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KitResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

/**
 * @swagger
 * /api/kit/{id}:
 *   get:
 *     tags:
 *       - kits
 *     summary: Get kit by ID (Admin, Manager, Staff, Laboratory Technician only)
 *     description: Retrieve detailed information about a specific kit
 *     operationId: getKitById
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kit ID
 *         example: "60d5ec9af682fbd12a0f4c3c"
 *     responses:
 *       200:
 *         description: Kit details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KitResponse'
 *       400:
 *         description: Invalid kit ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Kit not found
 *   
 *   put:
 *     tags:
 *       - kits
 *     summary: Update kit (Admin, Manager only)
 *     description: Update kit information (currently only notes can be updated)
 *     operationId: updateKit
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kit ID
 *         example: "60d5ec9af682fbd12a0f4c3c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateKitDto'
 *     responses:
 *       200:
 *         description: Kit updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KitResponse'
 *       400:
 *         description: Invalid input data or kit ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin or Manager access required
 *       404:
 *         description: Kit not found
 *         
 *   delete:
 *     tags:
 *       - kits
 *     summary: Delete kit (Admin, Manager only)
 *     description: Mark a kit as damaged or delete it from the system
 *     operationId: deleteKit
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kit ID
 *         example: "60d5ec9af682fbd12a0f4c3c"
 *     responses:
 *       200:
 *         description: Kit deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid kit ID format or kit is currently assigned/in use
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin or Manager access required
 *       404:
 *         description: Kit not found
 */

/**
 * @swagger
 * /api/kit/{id}/status:
 *   patch:
 *     tags:
 *       - kits
 *     summary: Change kit status (Admin, Manager, Staff, Laboratory Technician only)
 *     description: Change the status of a kit (available, assigned, used, returned, damaged)
 *     operationId: changeKitStatus
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kit ID
 *         example: "60d5ec9af682fbd12a0f4c3c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeKitStatusDto'
 *     responses:
 *       200:
 *         description: Kit status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KitResponse'
 *       400:
 *         description: Invalid input data or kit ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Kit not found
 *       422:
 *         description: Invalid status transition (e.g., cannot change from used to available directly)
 */

/**
 * @swagger
 * /api/kit/{id}/return:
 *   post:
 *     tags:
 *       - kits
 *     summary: Return a kit (Admin, Manager, Staff, Laboratory Technician only)
 *     description: Mark a kit as returned and update its status
 *     operationId: returnKit
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kit ID
 *         example: "60d5ec9af682fbd12a0f4c3c"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Notes about the returned kit
 *                 example: "Kit returned in good condition"
 *     responses:
 *       200:
 *         description: Kit returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KitResponse'
 *       400:
 *         description: Invalid kit ID format or kit is not in a returnable state
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Kit not found
 */