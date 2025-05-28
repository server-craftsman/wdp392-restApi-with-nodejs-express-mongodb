/**
 * @swagger
 * tags:
 *   name: departments
 *   description: Department management APIs
 */

/**
 * @swagger
 * /api/department/create:
 *   post:
 *     tags:
 *       - departments
 *     summary: Create new department (Admin only)
 *     description: Create a new department with manager assignment
 *     operationId: createDepartment
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDepartmentDto'
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentResponse'
 *       400:
 *         description: Invalid input data or invalid manager ID
 *       401:
 *         description: Unauthorized - Admin access required
 *       404:
 *         description: Manager not found or not a valid manager
 *       409:
 *         description: Department with this name already exists
 */

/**
 * @swagger
 * /api/department/search:
 *   get:
 *     tags:
 *       - departments
 *     summary: Search and filter departments (Admin, Manager, Laboratory Technician, Staff)
 *     description: Search departments with pagination and filtering options
 *     operationId: getDepartments
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
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search by department name or description
 *         example: "cardiology"
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *           enum: [name, created_at, updated_at]
 *         description: Field to sort results by
 *         example: "name"
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           default: desc
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *         example: "asc"
 *       - in: query
 *         name: is_deleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter by deletion status
 *         example: false
 *     responses:
 *       200:
 *         description: List of departments with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentPaginationResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

/**
 * @swagger
 * /api/department/manager/{managerId}:
 *   get:
 *     tags:
 *       - departments
 *     summary: Get departments by manager ID (Admin, Manager)
 *     description: Retrieve all departments managed by a specific manager
 *     operationId: getManagerDepartments
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manager ID
 *         example: "60d0fe4f5311236168a109ca"
 *       - in: query
 *         name: is_deleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include deleted departments
 *         example: false
 *     responses:
 *       200:
 *         description: List of departments managed by the specified manager
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ManagerDepartmentsResponse'
 *       400:
 *         description: Invalid manager ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin or Manager access required
 *       404:
 *         description: Manager not found
 */

/**
 * @swagger
 * /api/department/count:
 *   get:
 *     tags:
 *       - departments
 *     summary: Count departments (Admin, Manager)
 *     description: Get the total number of departments in the system
 *     operationId: countDepartments
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: is_deleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include deleted departments in count
 *         example: false
 *     responses:
 *       200:
 *         description: Total count of departments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentCountResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin or Manager access required
 */

/**
 * @swagger
 * /api/department/{id}:
 *   get:
 *     tags:
 *       - departments
 *     summary: Get department by ID (Admin, Manager, Laboratory Technician, Staff)
 *     description: Retrieve detailed information about a specific department
 *     operationId: getDepartmentById
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *         example: "60d0fe4f5311236168a109cb"
 *     responses:
 *       200:
 *         description: Department details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentResponse'
 *       400:
 *         description: Invalid department ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Department not found
 *
 *   put:
 *     tags:
 *       - departments
 *     summary: Update department (Admin, Manager)
 *     description: Update department information including name, description, and manager
 *     operationId: updateDepartment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *         example: "60d0fe4f5311236168a109cb"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDepartmentDto'
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentResponse'
 *       400:
 *         description: Invalid input data or department ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin or Manager access required
 *       404:
 *         description: Department or manager not found
 *       409:
 *         description: Department with this name already exists
 *
 *   delete:
 *     tags:
 *       - departments
 *     summary: Delete department (Admin only)
 *     description: Soft delete a department (marks as deleted but keeps in database)
 *     operationId: deleteDepartment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *         example: "60d0fe4f5311236168a109cb"
 *     responses:
 *       200:
 *         description: Department deleted successfully
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
 *                   example: "Department deleted successfully"
 *       400:
 *         description: Invalid department ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Department not found
 */

/**
 * @swagger
 * /api/department/{departmentId}/statistics:
 *   get:
 *     tags:
 *       - departments
 *     summary: Get department statistics (Admin, Manager)
 *     description: Retrieve statistical information about a department
 *     operationId: getDepartmentStatistics
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *         example: "60d0fe4f5311236168a109cb"
 *     responses:
 *       200:
 *         description: Department statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 staffCount:
 *                   type: integer
 *                   description: Number of staff in the department
 *                   example: 15
 *                 activeAppointments:
 *                   type: integer
 *                   description: Number of active appointments
 *                   example: 28
 *                 completedAppointments:
 *                   type: integer
 *                   description: Number of completed appointments
 *                   example: 142
 *                 serviceTypes:
 *                   type: integer
 *                   description: Number of different service types offered
 *                   example: 8
 *       400:
 *         description: Invalid department ID format
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin or Manager access required
 *       404:
 *         description: Department not found
 */