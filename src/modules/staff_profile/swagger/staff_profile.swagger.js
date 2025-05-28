/**
 * @swagger
 * tags:
 *   name: staff_profiles
 *   description: Staff profile management
 */

/**
 * @swagger
 * /api/staff-profile/create:
 *   post:
 *     tags:
 *       - staff_profiles
 *     summary: Create a new staff profile (Admin, Manager only)
 *     description: Create a new staff profile with user and department association
 *     operationId: createStaffProfile
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStaffProfileDto'
 *     responses:
 *       201:
 *         description: Staff profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffProfileResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: User already has a staff profile
 */

/**
 * @swagger
 * /api/staff-profile/search:
 *   get:
 *     tags:
 *       - staff_profiles
 *     summary: Search staff profiles (Admin, Manager only)
 *     description: Search for staff profiles with pagination and filtering
 *     operationId: getStaffProfiles
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, on_leave, terminated]
 *         description: Filter by staff status
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search by employee ID or job title
 *       - in: query
 *         name: hire_date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by hire date (start)
 *       - in: query
 *         name: hire_date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by hire date (end)
 *     responses:
 *       200:
 *         description: List of staff profiles with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffProfilePaginationResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/staff-profile/department/{id}:
 *   get:
 *     tags:
 *       - staff_profiles
 *     summary: Get staff profiles by department ID (Admin, Manager only)
 *     description: Retrieve staff profiles associated with a specific department
 *     operationId: getStaffProfilesByDepartment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: List of staff profiles in the department
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffProfilePaginationResponse'
 *       400:
 *         description: Invalid department ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */

/**
 * @swagger
 * /api/staff-profile/{id}:
 *   get:
 *     tags:
 *       - staff_profiles
 *     summary: Get staff profile by ID (Admin, Manager only)
 *     description: Retrieve staff profile details by ID
 *     operationId: getStaffProfileById
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff profile ID
 *     responses:
 *       200:
 *         description: Staff profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffProfileResponse'
 *       400:
 *         description: Invalid staff profile ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Staff profile not found
 *   
 *   put:
 *     tags:
 *       - staff_profiles
 *     summary: Update staff profile (Admin, Manager only)
 *     description: Update staff profile information
 *     operationId: updateStaffProfile
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStaffProfileDto'
 *     responses:
 *       200:
 *         description: Staff profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffProfileResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Staff profile not found
 */

/**
 * @swagger
 * /api/staff-profile/{id}/status:
 *   put:
 *     tags:
 *       - staff_profiles
 *     summary: Change staff status (Admin, Manager only)
 *     description: Change the status of a staff profile
 *     operationId: changeStaffStatus
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusChangeRequest'
 *     responses:
 *       200:
 *         description: Staff status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaffProfileResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Staff profile not found
 */
