/**
 * @swagger
 * components:
 *   schemas:
 *     CreateDepartmentDto:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - manager_id
 *       properties:
 *         name:
 *           type: string
 *           description: Department name
 *           example: "Cardiology Department"
 *         description:
 *           type: string
 *           description: Department description
 *           example: "Department for heart-related services and diagnostics"
 *         manager_id:
 *           type: string
 *           description: Manager ID (must be a user with MANAGER role)
 *           example: "60d0fe4f5311236168a109ca"
 *
 *     UpdateDepartmentDto:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - manager_id
 *       properties:
 *         name:
 *           type: string
 *           description: Department name
 *           example: "Cardiology Department"
 *         description:
 *           type: string
 *           description: Department description
 *           example: "Department for heart-related services and diagnostics"
 *         manager_id:
 *           type: string
 *           description: Manager ID (must be a user with MANAGER role)
 *           example: "60d0fe4f5311236168a109ca"
 *
 *     DepartmentResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Department ID
 *           example: "60d0fe4f5311236168a109cb"
 *         name:
 *           type: string
 *           description: Department name
 *           example: "Cardiology Department"
 *         description:
 *           type: string
 *           description: Department description
 *           example: "Department for heart-related services and diagnostics"
 *         manager_id:
 *           type: object
 *           description: Manager information
 *           properties:
 *             _id:
 *               type: string
 *               description: Manager ID
 *               example: "60d0fe4f5311236168a109ca"
 *             first_name:
 *               type: string
 *               description: Manager's first name
 *               example: "John"
 *             last_name:
 *               type: string
 *               description: Manager's last name
 *               example: "Smith"
 *             email:
 *               type: string
 *               description: Manager's email
 *               example: "john.smith@example.com"
 *         is_deleted:
 *           type: boolean
 *           description: Deletion status
 *           example: false
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *           example: "2023-06-15T09:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *           example: "2023-06-20T14:20:00.000Z"
 *
 *     DepartmentPaginationResponse:
 *       type: object
 *       properties:
 *         pageData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DepartmentResponse'
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
 *     DepartmentCountResponse:
 *       type: object
 *       properties:
 *         totalDepartments:
 *           type: integer
 *           description: Total number of departments
 *           example: 8
 *
 *     ManagerDepartmentsResponse:
 *       type: object
 *       properties:
 *         departments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DepartmentResponse'
 *         count:
 *           type: integer
 *           description: Number of departments managed by the manager
 *           example: 2
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Department not found"
 *         status:
 *           type: integer
 *           description: HTTP status code
 *           example: 404
 */
