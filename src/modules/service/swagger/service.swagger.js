/**
 * @swagger
 * tags:
 *   name: services
 *   description: Service management
 */

/**
 * @swagger
 * /api/service/create:
 *   post:
 *     tags:
 *       - services
 *     summary: Create a new service (Only Admin, Manager)
 *     description: Create a new DNA testing service in the system
 *     operationId: createService
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceDto'
 *     responses:
 *       201:
 *         description: Create service successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/service/search:
 *   get:
 *     tags:
 *       - services
 *     summary: Search and filter services (All roles)
 *     description: Search services with pagination and filtering by multiple criteria
 *     operationId: getServices
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by service type (civil, administrative)
 *       - in: query
 *         name: sample_method
 *         schema:
 *           type: string
 *         description: Filter by sample collection method (self_collected, facility_collected, home_collected)
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of services per page
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Sort by field (name, price, created_at, estimated_time)
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           default: desc
 *         description: Sort order (asc, desc)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by created date (start)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by created date (end)
 *     responses:
 *       200:
 *         description: List of services with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicePaginationResponse'
 *       401:   
 *         description: Unauthorized
 */

/**
 * @swagger     
 * /api/service/{id}:
 *   get:
 *     tags:
 *       - services
 *     summary: Get service information by ID (All roles)
 *     description: Retrieve detailed information of a service by ID
 *     operationId: getServiceById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Detailed service information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service not found
 *
 *   put:
 *     tags:
 *       - services
 *     summary: Update service (Only Admin, Manager)
 *     description: Update service information
 *     operationId: updateService
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServiceDto'
 *     responses:
 *       200:
 *         description: Update service successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceResponse'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service not found
 *
 *   delete:
 *     tags:
 *       - services
 *     summary: Delete service (Only Admin, Manager)
 *     description: Delete service (soft delete)
 *     operationId: deleteService
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Delete service successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service not found
 */

/**
 * @swagger
 * /api/service/{id}/child:
 *   get:
 *     tags:
 *       - services
 *     summary: Get list of child services (All roles)
 *     description: Get all child services of a parent service
 *     operationId: getChildServices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent service ID
 *     responses:
 *       200:
 *         description: List of child services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Parent service not found
 */

/**
 * @swagger
 * /api/service/appointments:
 *   get:
 *     tags:
 *       - services
 *     summary: Get services by appointment criteria (Admin, Manager, Staff)
 *     description: Filter services based on appointment related information
 *     operationId: getServicesByAppointment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by appointment status
 *       - in: query
 *         name: start_appointment_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by appointment date (start)
 *       - in: query
 *         name: end_appointment_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by appointment date (end)
 *       - in: query
 *         name: appointment_type
 *         schema:
 *           type: string
 *         description: Filter by appointment type (self, facility, home)
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *         description: Filter by customer ID
 *       - in: query
 *         name: staff_id
 *         schema:
 *           type: string
 *         description: Filter by staff ID
 *       - in: query
 *         name: collection_address
 *         schema:
 *           type: string
 *         description: Filter by collection address
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Number of services per page
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of services per page
 *     responses:
 *       200:
 *         description: List of services by appointment criteria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServicePaginationResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/service/statistics:
 *   get:
 *     tags:
 *       - services
 *     summary: Service statistics (Admin, Manager)
 *     description: Count services by type, status and sample collection method
 *     operationId: countServicesByType
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search by name or description
 *     responses:
 *       200:
 *         description: Service statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceStatisticsResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/service/{id}/status:
 *   patch:
 *     tags:
 *       - services
 *     summary: Change service status (Admin, Manager)
 *     description: Activate or deactivate a service
 *     operationId: changeServiceStatus
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 description: New active status
 *             required:
 *               - is_active
 *     responses:
 *       200:
 *         description: Change service status successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceResponse'
 *       400:
 *         description: Invalid input data or service has been deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service not found
 */
