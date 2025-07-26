/**
 * @swagger
 * components:
 *   schemas:
 *     CreateKitDto:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [regular, administrative]
 *           description: Type of kit (regular for customers, administrative for legal cases)
 *           example: "regular"
 *         notes:
 *           type: string
 *           description: Notes about the kit
 *           example: "Kit for DNA testing"
 *         administrative_case_id:
 *           type: string
 *           description: ID of the administrative case (for administrative kits only)
 *           example: "60d5ec9af682fbd12a0f4d4d"
 *         agency_authority:
 *           type: string
 *           description: Agency authority for administrative kits
 *           example: "Tòa án nhân dân TP.HCM"
 *
 *     UpdateKitDto:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [regular, administrative]
 *           description: Type of kit
 *           example: "regular"
 *         status:
 *           type: string
 *           enum: [available, assigned, used, returned, damaged]
 *           description: Status of the kit
 *           example: "available"
 *         assigned_date:
 *           type: string
 *           format: date-time
 *           description: Date when kit was assigned
 *           example: "2023-06-15T09:30:00.000Z"
 *         assigned_to_user_id:
 *           type: string
 *           description: ID of the assigned user
 *           example: "60d5ec9af682fbd12a0f4a1a"
 *         return_date:
 *           type: string
 *           format: date-time
 *           description: Date when kit was returned
 *           example: "2023-06-20T14:20:00.000Z"
 *         notes:
 *           type: string
 *           description: Notes about the kit
 *           example: "Kit has been sterilized and verified"
 *         administrative_case_id:
 *           type: string
 *           description: ID of the administrative case
 *           example: "60d5ec9af682fbd12a0f4d4d"
 *         agency_authority:
 *           type: string
 *           description: Agency authority
 *           example: "Tòa án nhân dân TP.HCM"
 *
 *     AssignKitDto:
 *       type: object
 *       required:
 *         - technician_id
 *       properties:
 *         technician_id:
 *           type: string
 *           description: ID of the technician to assign the kit to
 *           example: "60d5ec9af682fbd12a0f4a1a"
 *         type:
 *           type: string
 *           enum: [regular, administrative]
 *           description: Type of kit
 *           example: "regular"
 *         notes:
 *           type: string
 *           description: Notes about the assignment
 *           example: "Assigned for DNA testing"
 *
 *     ReturnKitDto:
 *       type: object
 *       properties:
 *         notes:
 *           type: string
 *           description: Notes about the returned kit condition
 *           example: "Kit returned in good condition, all components present"
 *         status:
 *           type: string
 *           enum: [available, assigned, used, returned, damaged]
 *           description: New status for the kit after return
 *           example: "available"
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
 *     SearchKitDto:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: Filter by kit code (full or partial)
 *           example: "KIT-20230615"
 *         type:
 *           type: string
 *           enum: [regular, administrative]
 *           description: Filter by kit type
 *           example: "regular"
 *         status:
 *           type: string
 *           enum: [available, assigned, used, returned, damaged]
 *           description: Filter by kit status
 *           example: "available"
 *         assigned_to_user_id:
 *           type: string
 *           description: Filter by assigned user ID
 *           example: "60d5ec9af682fbd12a0f4a1a"
 *         administrative_case_id:
 *           type: string
 *           description: Filter by administrative case ID
 *           example: "60d5ec9af682fbd12a0f4d4d"
 *         agency_authority:
 *           type: string
 *           description: Filter by agency authority
 *           example: "Tòa án"
 *         pageNum:
 *           type: integer
 *           description: Page number for pagination
 *           default: 1
 *           minimum: 1
 *           maximum: 100
 *           example: 1
 *         pageSize:
 *           type: integer
 *           description: Number of items per page
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *         sort_by:
 *           type: string
 *           description: Field to sort by
 *           default: "created_at"
 *           example: "created_at"
 *         sort_order:
 *           type: string
 *           enum: [asc, desc]
 *           description: Sort order
 *           default: "desc"
 *           example: "desc"
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
 *         type:
 *           type: string
 *           enum: [regular, administrative]
 *           description: Type of kit
 *           example: "regular"
 *         status:
 *           type: string
 *           enum: [available, assigned, used, returned, damaged]
 *           description: Current kit status
 *           example: "available"
 *         assigned_to_user_id:
 *           type: object
 *           description: User assigned to the kit (if any)
 *           properties:
 *             _id:
 *               type: string
 *               example: "60d5ec9af682fbd12a0f4a1a"
 *             first_name:
 *               type: string
 *               example: "Alex"
 *             last_name:
 *               type: string
 *               example: "Johnson"
 *             email:
 *               type: string
 *               example: "alex.johnson@example.com"
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
 *         administrative_case_id:
 *           type: object
 *           description: Associated administrative case (for administrative kits)
 *           properties:
 *             _id:
 *               type: string
 *               example: "60d5ec9af682fbd12a0f4d4d"
 *             case_number:
 *               type: string
 *               example: "PL-2025-277"
 *             case_type:
 *               type: string
 *               example: "sibling"
 *             status:
 *               type: string
 *               example: "submitted"
 *         agency_authority:
 *           type: string
 *           description: Agency authority for administrative kits
 *           example: "Tòa án nhân dân TP.HCM"
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
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/KitResponse'
 *         pagination:
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
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status
 *           example: true
 *         data:
 *           type: object
 *           description: Response data
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Operation completed successfully"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Invalid input data"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: Field name with error
 *               message:
 *                 type: string
 *                 description: Error message for the field
 *
 *     KitDetailedResponse:
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
 *         type:
 *           type: string
 *           enum: [regular, administrative]
 *           description: Type of kit
 *           example: "regular"
 *         status:
 *           type: string
 *           enum: [available, assigned, used, returned, damaged]
 *           description: Current kit status
 *           example: "available"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *           example: "2023-06-01T09:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *           example: "2023-06-01T09:30:00.000Z"
 */
