/**
 * @swagger
 * components:
 *   schemas:
 *     CreateKitDto:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: Kit code (optional, will be auto-generated if not provided)
 *           pattern: "^KIT-\\d{8}-\\d{3}$"
 *           example: "KIT-20230615-001"
 *
 *     UpdateKitDto:
 *       type: object
 *       properties:
 *         notes:
 *           type: string
 *           description: Notes about the kit
 *           example: "Kit has been sterilized and verified for proper functionality"
 *
 *     ReturnKitDto:
 *       type: object
 *       required:
 *         - kit_id
 *       properties:
 *         kit_id:
 *           type: string
 *           description: ID of the kit being returned
 *           example: "60d5ec9af682fbd12a0f4c3c"
 *         notes:
 *           type: string
 *           description: Notes about the returned kit condition
 *           example: "Kit returned in good condition, all components present"
 *
 *     ChangeKitStatusDto:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [available, assigned, used, returned, damaged]
 *           description: New status for the kit
 *           example: "available"
 *
 *     KitResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Kit ID
 *           example: "60d5ec9af682fbd12a0f4c3c"
 *         code:
 *           type: string
 *           description: Kit unique identifier code
 *           example: "KIT-20230615-001"
 *         status:
 *           type: string
 *           description: Current kit status
 *           enum: [available, assigned, used, returned, damaged]
 *           example: "available"
 *         appointment_id:
 *           type: object
 *           description: Associated appointment (if any)
 *           properties:
 *             _id:
 *               type: string
 *               example: "60d5ec9af682fbd12a0f4d4d"
 *             appointment_code:
 *               type: string
 *               example: "APP-20230615-001"
 *         assigned_to_user_id:
 *           type: object
 *           description: User assigned to the kit (if any)
 *           properties:
 *             _id:
 *               type: string
 *               example: "60d5ec9af682fbd12a0f4a1a"
 *             first_name:
 *               type: string
 *               example: "John"
 *             last_name:
 *               type: string
 *               example: "Doe"
 *             email:
 *               type: string
 *               example: "john.doe@example.com"
 *         assigned_date:
 *           type: string
 *           format: date-time
 *           description: Date when kit was assigned
 *           example: "2023-06-15T09:30:00.000Z"
 *         return_date:
 *           type: string
 *           format: date-time
 *           description: Date when kit was returned
 *           example: "2023-06-20T14:20:00.000Z"
 *         notes:
 *           type: string
 *           description: Notes about the kit
 *           example: "Kit has been sterilized and verified for proper functionality"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *           example: "2023-06-01T09:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *           example: "2023-06-20T14:20:00.000Z"
 *
 *     KitPaginationResponse:
 *       type: object
 *       properties:
 *         pageData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/KitResponse'
 *         pageInfo:
 *           type: object
 *           properties:
 *             totalItems:
 *               type: integer
 *               description: Total number of items
 *               example: 25
 *             totalPages:
 *               type: integer
 *               description: Total number of pages
 *               example: 3
 *             pageNum:
 *               type: integer
 *               description: Current page number
 *               example: 1
 *             pageSize:
 *               type: integer
 *               description: Number of items per page
 *               example: 10
 *
 *     SearchKitDto:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: Filter by kit code
 *           example: "KIT-20230615"
 *         status:
 *           type: string
 *           enum: [available, assigned, used, returned, damaged]
 *           description: Filter by kit status
 *           example: "available"
 *         appointment_id:
 *           type: string
 *           description: Filter by appointment ID
 *           example: "60d5ec9af682fbd12a0f4d4d"
 *         assigned_to_user_id:
 *           type: string
 *           description: Filter by assigned user ID
 *           example: "60d5ec9af682fbd12a0f4a1a"
 *         pageNum:
 *           type: integer
 *           description: Page number for pagination
 *           default: 1
 *           example: 1
 *         pageSize:
 *           type: integer
 *           description: Number of items per page
 *           default: 10
 *           example: 10
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status
 *           example: true
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Operation completed successfully"
 */
