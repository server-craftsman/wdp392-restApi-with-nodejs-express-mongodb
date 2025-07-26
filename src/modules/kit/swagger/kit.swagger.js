/**
 * @swagger
 * tags:
 *   name: kits
 *   description: Kit management APIs for DNA testing sample collection
 */

/**
 * @swagger
 * /api/kit/create:
 *   post:
 *     tags:
 *       - kits
 *     summary: Create a new kit (Admin, Manager only)
 *     description: Create a new kit with auto-generated code or specified code. Supports both regular and administrative kits.
 *     operationId: createKit
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateKitDto'
 *           example:
 *             type: "regular"
 *             notes: "Kit for DNA testing"
 *             administrative_case_id: "60d5ec9af682fbd12a0f4d4d"
 *             agency_authority: "Tòa án nhân dân TP.HCM"
 *     responses:
 *       201:
 *         description: Kit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input or malformed kit code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *     description: Search for kits with advanced filtering, pagination and sorting options
 *     operationId: searchKits
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Filter by kit code (full or partial match)
 *         example: "KIT-20230615"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [regular, administrative]
 *         description: Filter by kit type
 *         example: "regular"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, assigned, used, returned, damaged]
 *         description: Filter by kit status
 *         example: "available"
 *       - in: query
 *         name: assigned_to_user_id
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *         example: "60d5ec9af682fbd12a0f4a1a"
 *       - in: query
 *         name: administrative_case_id
 *         schema:
 *           type: string
 *         description: Filter by administrative case ID
 *         example: "60d5ec9af682fbd12a0f4d4d"
 *       - in: query
 *         name: agency_authority
 *         schema:
 *           type: string
 *         description: Filter by agency authority (for administrative kits)
 *         example: "Tòa án"
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *           maximum: 100
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: "created_at"
 *         description: Field to sort by
 *         example: "created_at"
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: Sort order
 *         example: "desc"
 *     responses:
 *       200:
 *         description: List of kits with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *     description: Retrieve all kits with 'available' status for assignment
 *     operationId: getAvailableKits
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: List of available kits
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *     description: Retrieve detailed information about a specific kit with populated references
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
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *     description: Update kit information including type, status, assignment details, and administrative fields
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
 *           example:
 *             type: "administrative"
 *             status: "assigned"
 *             assigned_to_user_id: "60d5ec9af682fbd12a0f4a1a"
 *             notes: "Updated for legal case"
 *             administrative_case_id: "60d5ec9af682fbd12a0f4d4d"
 *             agency_authority: "Tòa án nhân dân TP.HCM"
 *     responses:
 *       200:
 *         description: Kit updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *     description: Mark a kit as damaged (soft delete) - cannot delete kits that are currently assigned or in use
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
 * /api/kit/{id}/assign:
 *   post:
 *     tags:
 *       - kits
 *     summary: Assign a kit to a technician (Staff only)
 *     description: Assign an available kit to a technician
 *     operationId: assignKit
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
 *             $ref: '#/components/schemas/AssignKitDto'
 *           example:
 *             technician_id: "60d5ec9af682fbd12a0f4a1a"
 *             type: "regular"
 *             notes: "Assigned for DNA testing"
 *     responses:
 *       200:
 *         description: Kit assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input data, kit ID format, or kit is not available
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Staff access required
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
 *           example:
 *             status: "used"
 *     responses:
 *       200:
 *         description: Kit status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input data, kit ID format, or invalid status
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Kit not found
 */

/**
 * @swagger
 * /api/kit/{id}/return:
 *   post:
 *     tags:
 *       - kits
 *     summary: Return a kit (Admin, Manager, Staff, Laboratory Technician only)
 *     description: Mark a kit as returned with optional status change and notes
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
 *             $ref: '#/components/schemas/ReturnKitDto'
 *           example:
 *             notes: "Kit returned in good condition"
 *             status: "available"
 *     responses:
 *       200:
 *         description: Kit returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid kit ID format or kit is not in a returnable state
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Kit not found
 */