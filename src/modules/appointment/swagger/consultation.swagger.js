/**
 * @swagger
 * tags:
 *   name: consultations
 *   description: Consultation management APIs for DNA testing services
 */

/**
 * @swagger
 * /api/consultation:
 *   post:
 *     tags:
 *       - consultations
 *     summary: Create consultation request (Public - No authentication required)
 *     description: |
 *       Submit a consultation request for DNA testing services without needing to register an account.
 *       The system will automatically send confirmation emails and notify staff members.
 *     operationId: createConsultation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConsultationDto'
 *           examples:
 *             home_consultation:
 *               summary: Home consultation request
 *               value:
 *                 first_name: "Nguyễn"
 *                 last_name: "Văn A"
 *                 email: "nguyenvana@example.com"
 *                 phone_number: "0901234567"
 *                 type: "home"
 *                 collection_address: "123 Đường ABC, Quận 1, TP.HCM"
 *                 subject: "Tư vấn về xét nghiệm DNA dòng họ"
 *                 consultation_notes: "Tôi muốn tìm hiểu về quy trình và chi phí xét nghiệm DNA"
 *                 preferred_date: "2024-02-15"
 *                 preferred_time: "9:00 AM - 11:00 AM"
 *             facility_consultation:
 *               summary: Facility consultation request
 *               value:
 *                 first_name: "Trần"
 *                 last_name: "Thị B"
 *                 email: "tranthib@example.com"
 *                 phone_number: "0987654321"
 *                 type: "facility"
 *                 subject: "Tư vấn về xét nghiệm cha con"
 *                 consultation_notes: "Cần tư vấn về các loại xét nghiệm cha con"
 *                 preferred_date: "2024-02-20"
 *                 preferred_time: "2:00 PM - 4:00 PM"
 *     responses:
 *       201:
 *         description: Consultation request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultationSuccessResponse'
 *             example:
 *               status: "success"
 *               message: "Consultation request created successfully"
 *               data:
 *                 _id: "60d0fe4f5311236168a109ce"
 *                 first_name: "Nguyễn"
 *                 last_name: "Văn A"
 *                 email: "nguyenvana@example.com"
 *                 consultation_status: "REQUESTED"
 *                 created_at: "2024-01-15T10:00:00.000Z"
 *       400:
 *         description: Invalid input data or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   status: "error"
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "collection_address"
 *                       message: "Collection address is required for home consultation"
 *               missing_field:
 *                 summary: Missing required field
 *                 value:
 *                   status: "error"
 *                   message: "Email is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   get:
 *     tags:
 *       - consultations
 *     summary: Get consultation requests (Admin/Manager/Staff only)
 *     description: |
 *       Retrieve paginated list of consultation requests with filtering options.
 *       Staff members can only see consultations assigned to them.
 *     operationId: getConsultationRequests
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: consultation_status
 *         schema:
 *           type: string
 *           enum: [REQUESTED, ASSIGNED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, FOLLOW_UP_REQUIRED]
 *         description: Filter by consultation status
 *         example: "REQUESTED"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [home, facility]
 *         description: Filter by consultation type
 *         example: "home"
 *       - in: query
 *         name: search_term
 *         schema:
 *           type: string
 *         description: Search by customer name, email, or subject
 *         example: "Nguyễn"
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter consultations from this date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter consultations until this date (YYYY-MM-DD)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Consultation requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultationListResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/consultation/{id}:
 *   get:
 *     tags:
 *       - consultations
 *     summary: Get consultation by ID (Admin/Manager/Staff only)
 *     description: Retrieve detailed information about a specific consultation request
 *     operationId: getConsultationById
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Consultation ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109ce"
 *     responses:
 *       200:
 *         description: Consultation details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultationSuccessResponse'
 *       400:
 *         description: Invalid consultation ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Consultation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/consultation/{id}/assign:
 *   patch:
 *     tags:
 *       - consultations
 *     summary: Assign consultant to consultation (Admin/Manager only)
 *     description: |
 *       Assign a staff member or manager as consultant to handle a consultation request.
 *       This will update the consultation status to 'ASSIGNED' and send notification emails.
 *     operationId: assignConsultant
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Consultation ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109ce"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignConsultantRequest'
 *           example:
 *             consultant_id: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Consultant assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultationSuccessResponse'
 *             example:
 *               status: "success"
 *               message: "Consultant assigned successfully"
 *               data:
 *                 _id: "60d0fe4f5311236168a109ce"
 *                 consultation_status: "ASSIGNED"
 *                 assigned_consultant_id:
 *                   _id: "60d0fe4f5311236168a109ca"
 *                   first_name: "Lê"
 *                   last_name: "Thị B"
 *                   email: "consultant@example.com"
 *       400:
 *         description: Invalid input or consultation ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin/Manager access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Consultation or consultant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/consultation/{id}/status:
 *   patch:
 *     tags:
 *       - consultations
 *     summary: Update consultation status (Admin/Manager/Staff only)
 *     description: |
 *       Update the status of a consultation and optionally add meeting details, notes, and follow-up information.
 *       Staff can only update consultations assigned to them.
 *     operationId: updateConsultationStatus
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Consultation ID (MongoDB ObjectId)
 *         example: "60d0fe4f5311236168a109ce"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConsultationStatusRequest'
 *           examples:
 *             schedule_consultation:
 *               summary: Schedule consultation
 *               value:
 *                 status: "SCHEDULED"
 *                 appointment_date: "2024-02-15T10:00:00.000Z"
 *                 meeting_link: "https://meet.google.com/abc-def-ghi"
 *                 meeting_notes: "Cuộc họp tư vấn về quy trình xét nghiệm DNA"
 *             complete_consultation:
 *               summary: Complete consultation
 *               value:
 *                 status: "COMPLETED"
 *                 meeting_notes: "Đã tư vấn đầy đủ về các dịch vụ xét nghiệm"
 *                 follow_up_required: false
 *             require_followup:
 *               summary: Require follow-up consultation
 *               value:
 *                 status: "FOLLOW_UP_REQUIRED"
 *                 meeting_notes: "Cần thêm thông tin về chi phí"
 *                 follow_up_required: true
 *                 follow_up_date: "2024-02-22T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Consultation status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsultationSuccessResponse'
 *       400:
 *         description: Invalid input or consultation ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Consultation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */ 