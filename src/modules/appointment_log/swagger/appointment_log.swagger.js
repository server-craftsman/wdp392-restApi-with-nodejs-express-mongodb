/**
 * @swagger
 * tags:
 *   name: appointment_logs
 *   description: Appointment log management APIs
 */

/**
 * @swagger
 * /api/appointment-logs/appointment/{appointmentId}:
 *   get:
 *     tags:
 *       - appointment_logs
 *     summary: Get logs by appointment ID (Admin, Manager, Customer)
 *     description: Retrieve the history of status changes and actions for a specific appointment
 *     operationId: getLogsByAppointment
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID to retrieve logs for
 *         example: "60d0fe4f5311236168a109ce"
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
 *         description: Number of logs per page
 *         example: 10
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at]
 *         description: Field to sort results by
 *         example: "created_at"
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *         example: "desc"
 *     responses:
 *       200:
 *         description: List of appointment logs with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentLogPaginationResponse'
 *       400:
 *         description: Invalid appointment ID format or query parameters
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - User does not have permission to view these logs
 *       404:
 *         description: Appointment not found
 */