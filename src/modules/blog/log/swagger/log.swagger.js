/**
 * @swagger
 * components:
 *   schemas:
 *     LogResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the log
 *         blog_id:
 *           type: string
 *           description: ID of the blog
 *         author_id:
 *           type: string
 *           description: ID of the author who made the changes
 *         old_title:
 *           type: string
 *           description: Previous title of the blog
 *         new_title:
 *           type: string
 *           description: New title of the blog
 *         old_content:
 *           type: string
 *           description: Previous content of the blog
 *         new_content:
 *           type: string
 *           description: New content of the blog
 *         old_blog_category_id:
 *           type: string
 *           description: Previous blog category ID
 *         new_blog_category_id:
 *           type: string
 *           description: New blog category ID
 *         old_service_id:
 *           type: string
 *           description: Previous service ID
 *         new_service_id:
 *           type: string
 *           description: New service ID
 *         old_user_id:
 *           type: string
 *           description: Previous user ID
 *         new_user_id:
 *           type: string
 *           description: New user ID
 *         old_is_published:
 *           type: boolean
 *           description: Previous published status
 *         new_is_published:
 *           type: boolean
 *           description: New published status
 *         old_published_at:
 *           type: string
 *           format: date-time
 *           description: Previous published date
 *         new_published_at:
 *           type: string
 *           format: date-time
 *           description: New published date
 *         old_images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogImage'
 *           description: Previous images
 *         new_images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogImage'
 *           description: New images
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date when the log was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date when the log was last updated
 *
 *     LogSearch:
 *       type: object
 *       properties:
 *         blog_id:
 *           type: string
 *           description: ID of the blog to filter by
 *         author_id:
 *           type: string
 *           description: ID of the author to filter by
 *         created_at_from:
 *           type: string
 *           format: date-time
 *           description: Filter logs created after this date
 *         created_at_to:
 *           type: string
 *           format: date-time
 *           description: Filter logs created before this date
 */

/**
 * @swagger
 * tags:
 *   name: BlogLogs
 *   description: Blog log management API
 */

/**
 * @swagger
 * /api/blog-logs/{id}:
 *   get:
 *     summary: Get a blog log by ID
 *     tags: [BlogLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the log
 *     responses:
 *       200:
 *         description: Blog log details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/LogResponse'
 *                 message:
 *                   type: string
 *                   example: Blog log fetched successfully
 *       404:
 *         description: Blog log not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blog-logs/blog/{blogId}:
 *   get:
 *     summary: Get logs for a specific blog
 *     tags: [BlogLogs]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog
 *     responses:
 *       200:
 *         description: List of blog logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LogResponse'
 *                 message:
 *                   type: string
 *                   example: Blog logs fetched successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blog-logs/search:
 *   post:
 *     summary: Search blog logs with pagination
 *     tags: [BlogLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               searchCondition:
 *                 $ref: '#/components/schemas/LogSearch'
 *               pageInfo:
 *                 type: object
 *                 properties:
 *                   pageNum:
 *                     type: number
 *                     example: 1
 *                   pageSize:
 *                     type: number
 *                     example: 10
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     pageData:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LogResponse'
 *                     pageInfo:
 *                       type: object
 *                       properties:
 *                         pageNum:
 *                           type: number
 *                           example: 1
 *                         pageSize:
 *                           type: number
 *                           example: 10
 *                         totalItems:
 *                           type: number
 *                           example: 50
 *                         totalPages:
 *                           type: number
 *                           example: 5
 *                 message:
 *                   type: string
 *                   example: Blog logs searched successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */ 