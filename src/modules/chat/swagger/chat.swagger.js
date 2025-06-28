/**
 * @swagger
 * tags:
 *   - name: chat
 *     description: Quản lý chat realtime
 */

/**
 * @swagger
 * /api/chat/rooms:
 *   get:
 *     tags:
 *       - chat
 *     summary: Lấy danh sách phòng chat đang có tin nhắn
 *     responses:
 *       '200':
 *         description: Danh sách roomId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["room-1", "room-2"]
 */

/**
 * @swagger
 * /api/chat/rooms/{roomId}/messages:
 *   get:
 *     tags:
 *       - chat
 *     summary: Lấy danh sách tin nhắn của phòng
 *     parameters:
 *       - name: roomId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phòng chat
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số tin nhắn mỗi trang
 *     responses:
 *       '200':
 *         description: Danh sách tin nhắn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       room_id:
 *                         type: string
 *                       sender:
 *                         type: string
 *                       message:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */ 