/**
 * @swagger
 * components:
 *   securitySchemes:
 *     Bearer:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     BlogImage:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the image (automatically generated from the uploaded file name)
 *         image_url:
 *           type: string
 *           description: URL of the image (automatically generated from AWS S3 upload)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date when the image was created (automatically generated)
 *       required:
 *         - name
 *         - image_url
 *
 *     CreateBlog:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the blog
 *         content:
 *           type: string
 *           description: Content of the blog
 *         slug:
 *           type: string
 *           description: URL slug for the blog (optional, will be generated from title if not provided)
 *         user_id:
 *           type: string
 *           description: ID of the user who created the blog (automatically extracted from JWT token)
 *         service_id:
 *           type: string
 *           description: ID of the service associated with the blog
 *         blog_category_id:
 *           type: string
 *           description: ID of the blog category
 *         is_published:
 *           type: boolean
 *           description: Whether the blog is published (optional, defaults to true)
 *         published_at:
 *           type: string
 *           format: date-time
 *           description: Date when the blog was published (optional, defaults to current date)
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogImage'
 *           description: Images associated with the blog
 *       required:
 *         - title
 *         - content
 *         - service_id
 *         - blog_category_id
 *
 *     UpdateBlog:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the blog
 *         content:
 *           type: string
 *           description: Content of the blog
 *         slug:
 *           type: string
 *           description: URL slug for the blog
 *         user_id:
 *           type: string
 *           description: ID of the user who created the blog (automatically extracted from JWT token)
 *         service_id:
 *           type: string
 *           description: ID of the service associated with the blog
 *         blog_category_id:
 *           type: string
 *           description: ID of the blog category
 *         is_published:
 *           type: boolean
 *           description: Whether the blog is published (optional)
 *         published_at:
 *           type: string
 *           format: date-time
 *           description: Date when the blog was published (optional)
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogImage'
 *           description: Images associated with the blog
 *     BlogResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the blog
 *         title:
 *           type: string
 *           description: Title of the blog
 *         content:
 *           type: string
 *           description: Content of the blog
 *         slug:
 *           type: string
 *           description: URL slug for the blog
 *         user_id:
 *           type: string
 *           description: ID of the user who created the blog
 *         service_id:
 *           type: string
 *           description: ID of the service associated with the blog
 *         blog_category_id:
 *           type: string
 *           description: ID of the blog category
 *         is_published:
 *           type: boolean
 *           description: Whether the blog is published
 *         published_at:
 *           type: string
 *           format: date-time
 *           description: Date when the blog was published
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogImage'
 *           description: Images associated with the blog
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date when the blog was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date when the blog was last updated
 *
 *     BlogSearch:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Title to search for (partial match)
 *         blog_category_id:
 *           type: string
 *           description: ID of the blog category to filter by
 *         user_id:
 *           type: string
 *           description: ID of the user to filter by
 *         service_id:
 *           type: string
 *           description: ID of the service to filter by
 *         is_published:
 *           type: boolean
 *           description: Filter by published status
 *
 *     DeleteImageRequest:
 *       type: object
 *       properties:
 *         image_url:
 *           type: string
 *           description: URL of the image to delete
 *       required:
 *         - image_url
 *
 *     LogResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the log entry
 *         blog_id:
 *           type: string
 *           description: ID of the blog this log belongs to
 *         author_id:
 *           type: string
 *           description: ID of the user who made the changes
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
 *         old_slug:
 *           type: string
 *           description: Previous slug of the blog
 *         new_slug:
 *           type: string
 *           description: New slug of the blog
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
 *           description: Previous images of the blog
 *         new_images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogImage'
 *           description: New images of the blog
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
 *           description: ID of the blog to filter logs by
 *         author_id:
 *           type: string
 *           description: ID of the author to filter logs by
 *         created_at_from:
 *           type: string
 *           format: date-time
 *           description: Start date for filtering logs
 *         created_at_to:
 *           type: string
 *           format: date-time
 *           description: End date for filtering logs
 */

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management API
 */

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of blogs
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
 *                     $ref: '#/components/schemas/BlogResponse'
 *                 message:
 *                   type: string
 *                   example: Blogs fetched successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blog/create:
 *   post:
 *     summary: Create a new blog with optional image uploads
 *     description: Creates a new blog with the provided data. Images are uploaded to AWS S3, and their metadata (name, URL, creation date) are automatically generated and stored in the database. The original file name is used for the image name, the S3 URL is stored as image_url, and the current date is used for created_at. The user_id is automatically extracted from the JWT token.
 *     tags: [Blogs]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the blog
 *               content:
 *                 type: string
 *                 description: Content of the blog
 *               slug:
 *                 type: string
 *                 description: URL slug for the blog (optional)
 *               service_id:
 *                 type: string
 *                 description: ID of the service associated with the blog
 *               blog_category_id:
 *                 type: string
 *                 description: ID of the blog category
 *               is_published:
 *                 type: boolean
 *                 description: Whether the blog is published (optional, defaults to true)
 *               published_at:
 *                 type: string
 *                 format: date-time
 *                 description: Date when the blog was published (optional, defaults to current date)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images to upload (up to 10). These will be automatically uploaded to AWS S3.
 *             required:
 *               - title
 *               - content
 *               - service_id
 *               - blog_category_id
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/BlogResponse'
 *                 message:
 *                   type: string
 *                   example: Blog created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blog/slug/{slug}:
 *   get:
 *     summary: Get a blog by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Slug of the blog
 *     responses:
 *       200:
 *         description: Blog details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/BlogResponse'
 *                 message:
 *                   type: string
 *                   example: Blog fetched successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blog/{id}:
 *   get:
 *     summary: Get a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog
 *     responses:
 *       200:
 *         description: Blog details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/BlogResponse'
 *                 message:
 *                   type: string
 *                   example: Blog fetched successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update a blog with optional image uploads
 *     description: Updates a blog with the provided data. If images are uploaded, they are stored in AWS S3, and their metadata (name, URL, creation date) are automatically generated and stored in the database. The original file name is used for the image name, the S3 URL is stored as image_url, and the current date is used for created_at. Any uploaded images will REPLACE the blog's existing images, not add to them. The user_id for tracking changes is automatically extracted from the JWT token.
 *     tags: [Blogs]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the blog
 *               content:
 *                 type: string
 *                 description: Content of the blog
 *               slug:
 *                 type: string
 *                 description: URL slug for the blog
 *               service_id:
 *                 type: string
 *                 description: ID of the service associated with the blog
 *               blog_category_id:
 *                 type: string
 *                 description: ID of the blog category
 *               is_published:
 *                 type: boolean
 *                 description: Whether the blog is published (optional)
 *               published_at:
 *                 type: string
 *                 format: date-time
 *                 description: Date when the blog was published (optional)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New images to upload (up to 10). These will be automatically uploaded to AWS S3 and will REPLACE any existing images.
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/BlogResponse'
 *                 message:
 *                   type: string
 *                   example: Blog updated successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete a blog
 *     tags: [Blogs]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/BlogResponse'
 *                 message:
 *                   type: string
 *                   example: Blog deleted successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blog/{id}/image:
 *   delete:
 *     summary: Delete an image from a blog
 *     description: Deletes an image from a blog by its URL. Note that this only removes the image reference from the database, not from AWS S3.
 *     tags: [Blogs]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteImageRequest'
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/BlogResponse'
 *                 message:
 *                   type: string
 *                   example: Blog image deleted successfully
 *       400:
 *         description: Image URL is required
 *       404:
 *         description: Blog not found or image not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blog/search:
 *   post:
 *     summary: Search blogs with pagination
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               searchCondition:
 *                 $ref: '#/components/schemas/BlogSearch'
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
 *                         $ref: '#/components/schemas/BlogResponse'
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
 *                   example: Blogs searched successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/blog/{id}/logs:
 *   get:
 *     summary: Get logs for a blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the blog
 *     responses:
 *       200:
 *         description: Blog logs
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
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */ 