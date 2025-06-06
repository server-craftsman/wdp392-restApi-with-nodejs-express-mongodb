/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBlogCategory:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the blog category
 *       required:
 *         - name
 *
 *     UpdateBlogCategory:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the blog category
 *
 *     BlogCategoryResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the blog category
 *         name:
 *           type: string
 *           description: Name of the blog category
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date when the blog category was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date when the blog category was last updated
 *
 *     BlogCategorySearch:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name to search for (partial match)
 */

/**
 * @swagger
 * tags:
 *   name: blog_categories
 *   description: Blog category management API
 */

/**
 * @swagger
 * /api/blog-category:
 *   post:
 *     summary: Create a new blog category
 *     tags: [blog_categories]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBlogCategory'
 *     responses:
 *       201:
 *         description: Blog category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/BlogCategoryResponse'
 *                 message:
 *                   type: string
 *                   example: Blog category created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Blog category with this name already exists
 *       500:
 *         description: Server error
 *
 *   get:
 *     summary: Get all blog categories
 *     tags: [blog_categories]
 *     responses:
 *       200:
 *         description: List of blog categories
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
 *                     $ref: '#/components/schemas/BlogCategoryResponse'
 *                 message:
 *                   type: string
 *                   example: Blog categories fetched successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blog-category/{id}:
 *   get:
 *     summary: Get a blog category by ID
 *     tags: [blog_categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog category
 *     responses:
 *       200:
 *         description: Blog category details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/BlogCategoryResponse'
 *                 message:
 *                   type: string
 *                   example: Blog category fetched successfully
 *       404:
 *         description: Blog category not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update a blog category
 *     tags: [blog_categories]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBlogCategory'
 *     responses:
 *       200:
 *         description: Blog category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/BlogCategoryResponse'
 *                 message:
 *                   type: string
 *                   example: Blog category updated successfully
 *       404:
 *         description: Blog category not found
 *       409:
 *         description: Blog category with this name already exists
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete a blog category
 *     tags: [blog_categories]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog category
 *     responses:
 *       200:
 *         description: Blog category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/BlogCategoryResponse'
 *                 message:
 *                   type: string
 *                   example: Blog category deleted successfully
 *       404:
 *         description: Blog category not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blog-category/search:
 *   post:
 *     summary: Search blog categories with pagination
 *     tags: [blog_categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               searchCondition:
 *                 $ref: '#/components/schemas/BlogCategorySearch'
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
 *                         $ref: '#/components/schemas/BlogCategoryResponse'
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
 *                   example: Blog categories searched successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */ 