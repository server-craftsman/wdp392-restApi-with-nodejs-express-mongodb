/**
 * @swagger
 * tags:
 *   - name: dashboard
 *     description: Dashboard & analytics endpoints
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     tags: [dashboard]
 *     summary: Tổng quan hệ thống (admin, manager)
 *     description: Trả về các số liệu tổng quan của toàn bộ hệ thống – người dùng, cuộc hẹn, mẫu, kết quả, thanh toán, doanh thu.
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     users: { type: integer, example: 1500 }
 *                     appointments: { type: integer, example: 320 }
 *                     samples: { type: integer, example: 640 }
 *                     results: { type: integer, example: 298 }
 *                     payments: { type: integer, example: 280 }
 *                     revenue: { type: number, example: 125000000 }
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Dashboard summary fetched successfully" }
 *       401:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/dashboard/revenue:
 *   get:
 *     tags: [dashboard]
 *     summary: Thống kê doanh thu theo ngày (admin, manager)
 *     description: Lấy doanh thu nhóm theo ngày trong khoảng thời gian. Nếu không truyền `from`/`to` sẽ trả toàn bộ.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string, example: "2025-05-01" }
 *                       total: { type: number, example: 5000000 }
 *                       count: { type: integer, example: 12 }
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Revenue data fetched successfully" }
 *       401:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/dashboard/payments/status:
 *   get:
 *     tags: [dashboard]
 *     summary: Thống kê số lượng thanh toán theo trạng thái (admin, manager)
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   additionalProperties: { type: integer }
 *                   example:
 *                     pending: 25
 *                     completed: 200
 *                     cancelled: 10
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Payment status counts fetched successfully" }
 *       401:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/dashboard/staff/summary:
 *   get:
 *     tags: [dashboard]
 *     summary: Thống kê cuộc hẹn gán cho nhân viên (staff)
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   additionalProperties: { type: integer }
 *                   example:
 *                     total_assigned: 40
 *                     pending: 10
 *                     confirmed: 5
 *                     sample_collected: 8
 *                     testing: 7
 *                     completed: 10
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Staff dashboard summary fetched successfully" }
 *       401:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/dashboard/lab-tech/summary:
 *   get:
 *     tags: [dashboard]
 *     summary: Thống kê cuộc hẹn gán cho kỹ thuật viên xét nghiệm (lab-tech)
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   additionalProperties: { type: integer }
 *                   example:
 *                     total_assigned: 30
 *                     testing: 18
 *                     completed: 12
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Laboratory technician dashboard summary fetched successfully" }
 *       401:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */ 