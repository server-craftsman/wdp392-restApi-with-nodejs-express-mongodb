/**
 * @swagger
 * tags:
 *   name: administrative_cases
 *   description: Quản lý các vụ việc xét nghiệm DNA hành chính
 */

/**
 * @swagger
 * /api/administrative-cases:
 *   post:
 *     tags: [administrative_cases]
 *     summary: Tạo mới vụ việc hành chính
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdministrativeCase'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdministrativeCase'
 *   get:
 *     tags: [administrative_cases]
 *     summary: Lấy danh sách vụ việc hành chính
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Danh sách vụ việc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdministrativeCase'
 * /api/administrative-cases/{id}:
 *   get:
 *     tags: [administrative_cases]
 *     summary: Lấy chi tiết vụ việc hành chính
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết vụ việc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdministrativeCase'
 *   put:
 *     tags: [administrative_cases]
 *     summary: Cập nhật vụ việc hành chính
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdministrativeCase'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdministrativeCase'
 *   delete:
 *     tags: [administrative_cases]
 *     summary: Xoá vụ việc hành chính
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xoá thành công
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AdministrativeCase:
 *       type: object
 *       properties:
 *         case_number:
 *           type: string
 *         authorization_code:
 *           type: string
 *         agency_contact_email:
 *           type: string
 *         agency_contact_name:
 *           type: string
 *         agency_contact_phone:
 *           type: string
 */