import mongoose, { Schema } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';
import { IAppointment } from './appointment.interface';
import { AppointmentStatusEnum, TypeEnum, PaymentStatusEnum } from './appointment.enum';
import { CreateAppointmentDto } from './dtos/createAppointment.dto';
import { CreateConsultationDto } from './dtos/createConsultation.dto';
import { AssignStaffDto } from './dtos/assign-staff.dto';
import { ConfirmAppointmentDto } from './dtos/confirm-appointment.dto';
import { SearchAppointmentDto } from './dtos/search-appointment.dto';
import AppointmentRepository from './appointment.repository';
import SlotSchema from '../slot/slot.model';
import { SlotStatusEnum } from '../slot/slot.enum';
import ServiceSchema from '../service/service.model';
import { SampleMethodEnum } from '../service/service.enum';
import AppointmentLogService from '../appointment_log/appointment_log.service';
import { AppointmentLogTypeEnum } from '../appointment_log/appointment_log.enum';
import KitService from '../kit/kit.service';
import StaffProfileSchema from '../staff_profile/staff_profile.model';
import { StaffStatusEnum } from '../staff_profile/staff_profile.enum';
import UserSchema from '../user/user.model';
import { UserRoleEnum } from '../user/user.enum';
import SampleService from '../sample/sample.service';
import { ISample } from '../sample/sample.interface';
import { sendMail, createNotificationEmailTemplate } from '../../core/utils';
import { ISendMailDetail } from '../../core/interfaces';
import AdministrativeCaseSchema from '../administrative_cases/administrative_cases.model';
import { AdministrativeCaseStatus } from '../administrative_cases/administrative_cases.enum';
import { ServiceTypeEnum } from '../service/service.enum';
import PaymentService from '../payment/payment.service';
import ConsultationSchema from './consultation.model';
import { IConsultation, ConsultationStatusEnum } from './consultation.interface';
import { AppointmentPaymentStageEnum } from './appointment.enum';
import AdministrativeCaseService from '../administrative_cases/administrative_cases.service';
import ServiceService from '../service/service.service';
import UserRepository from '../user/user.repository';
import AdministrativeCasesService from '../administrative_cases/administrative_cases.service';

// Add business hour constants just after other imports
// CONSTANTS_START
const BUSINESS_HOURS_START: number = process.env.BUSINESS_HOURS_START ? parseInt(process.env.BUSINESS_HOURS_START) : 0;
const BUSINESS_HOURS_END: number = process.env.BUSINESS_HOURS_END ? parseInt(process.env.BUSINESS_HOURS_END) : 0;
const HOME_SERVICE_SURCHARGE_PERCENTAGE: number = process.env.HOME_SERVICE_SURCHARGE_PERCENTAGE ? parseFloat(process.env.HOME_SERVICE_SURCHARGE_PERCENTAGE) : 0;
// CONSTANTS_END

export default class AppointmentService {
    private readonly appointmentRepository: AppointmentRepository;
    private readonly appointmentLogService: AppointmentLogService;
    private readonly userRepository: UserRepository;
    private readonly consultationSchema: typeof ConsultationSchema;
    private readonly kitService: KitService;
    private readonly staffProfileSchema: typeof StaffProfileSchema;
    private sampleService?: SampleService;
    private readonly administrativeCaseService: AdministrativeCasesService;
    private readonly serviceService: ServiceService;
    private readonly paymentService: PaymentService;

    constructor() {
        this.appointmentRepository = new AppointmentRepository();
        this.userRepository = new UserRepository();
        this.appointmentLogService = new AppointmentLogService();
        this.consultationSchema = ConsultationSchema;
        this.kitService = new KitService();
        this.staffProfileSchema = StaffProfileSchema;
        this.administrativeCaseService = new AdministrativeCasesService();
        this.serviceService = new ServiceService();
        this.paymentService = new PaymentService();
    }

    private getSampleService(): SampleService {
        if (!this.sampleService) {
            this.sampleService = new SampleService();
        }
        return this.sampleService;
    }

    /**
     * Convert AppointmentStatusEnum to AppointmentLogTypeEnum
     */
    private convertStatusToLogType(status: any): AppointmentLogTypeEnum {
        // Map appointment status to log type
        const statusMap: Record<string, AppointmentLogTypeEnum> = {
            'pending': AppointmentLogTypeEnum.PENDING,
            'confirmed': AppointmentLogTypeEnum.CONFIRMED,
            'sample_assigned': AppointmentLogTypeEnum.SAMPLE_ASSIGNED,
            'sample_collected': AppointmentLogTypeEnum.SAMPLE_COLLECTED,
            'sample_received': AppointmentLogTypeEnum.SAMPLE_RECEIVED,
            'testing': AppointmentLogTypeEnum.TESTING,
            'completed': AppointmentLogTypeEnum.COMPLETED,
            'cancelled': AppointmentLogTypeEnum.CANCELLED,
            'awaiting_authorization': AppointmentLogTypeEnum.AWAITING_AUTHORIZATION,
            'authorized': AppointmentLogTypeEnum.AUTHORIZED,
            'ready_for_collection': AppointmentLogTypeEnum.READY_FOR_COLLECTION
        };

        return statusMap[status] || AppointmentLogTypeEnum.PENDING;
    }

    /**
     * Create consultation request - không cần đăng ký tài khoản
     */
    public async createConsultation(consultationData: CreateConsultationDto): Promise<IConsultation> {
        try {
            // Validate địa chỉ nếu là HOME consultation
            if (consultationData.type === TypeEnum.HOME && !consultationData.collection_address) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'Collection address is required for home consultation'
                );
            }

            // Tạo consultation record
            const consultation = new ConsultationSchema({
                first_name: consultationData.first_name,
                last_name: consultationData.last_name,
                email: consultationData.email,
                phone_number: consultationData.phone_number,
                type: consultationData.type,
                collection_address: consultationData.collection_address,
                subject: consultationData.subject,
                consultation_notes: consultationData.consultation_notes,
                preferred_date: consultationData.preferred_date ? new Date(consultationData.preferred_date) : undefined,
                preferred_time: consultationData.preferred_time,
                consultation_status: ConsultationStatusEnum.REQUESTED,
                created_at: new Date(),
                updated_at: new Date()
            });

            const savedConsultation = await consultation.save();

            // Note: Consultation logging will be handled separately
            // as consultations are not appointments in the new system

            // Send confirmation email
            try {
                await this.sendConsultationRequestEmail(savedConsultation);
            } catch (emailError) {
                console.error('Failed to send consultation request email:', emailError);
            }

            // Send notification to admin/staff
            try {
                await this.sendConsultationNotificationToStaff(savedConsultation);
            } catch (emailError) {
                console.error('Failed to send consultation notification to staff:', emailError);
            }

            return savedConsultation;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating consultation request');
        }
    }

    /**
     * Get all consultation requests (for staff/admin)
     */
    public async getConsultationRequests(
        searchParams: any,
        userRole: UserRoleEnum,
        userId?: string
    ): Promise<SearchPaginationResponseModel<IConsultation>> {
        try {
            const pageNum = searchParams.pageNum || 1;
            const pageSize = searchParams.pageSize || 10;
            const skip = (pageNum - 1) * pageSize;

            // Build query
            const query: any = {};

            // Role-based filtering
            if (userRole === UserRoleEnum.STAFF && userId) {
                query.assigned_consultant_id = userId;
            }

            // Apply filters
            if (searchParams.consultation_status) {
                query.consultation_status = searchParams.consultation_status;
            }

            if (searchParams.type) {
                query.type = searchParams.type;
            }

            if (searchParams.start_date || searchParams.end_date) {
                query.created_at = {};
                if (searchParams.start_date) {
                    query.created_at.$gte = new Date(searchParams.start_date);
                }
                if (searchParams.end_date) {
                    query.created_at.$lte = new Date(searchParams.end_date);
                }
            }

            // Search by email or name
            if (searchParams.search_term) {
                const searchRegex = new RegExp(searchParams.search_term, 'i');
                query.$or = [
                    { email: { $regex: searchRegex } },
                    { first_name: { $regex: searchRegex } },
                    { last_name: { $regex: searchRegex } },
                    { subject: { $regex: searchRegex } }
                ];
            }

            // Count total documents
            const totalCount = await ConsultationSchema.countDocuments(query);

            // Fetch consultations with pagination
            const consultations = await ConsultationSchema.find(query)
                .populate('assigned_consultant_id', 'first_name last_name email')
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(pageSize);

            return {
                pageData: consultations,
                pageInfo: {
                    totalItems: totalCount,
                    pageNum,
                    pageSize,
                    totalPages: Math.ceil(totalCount / pageSize)
                }
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting consultation requests');
        }
    }

    /**
     * Assign consultant to consultation request
     */
    public async assignConsultant(
        consultationId: string,
        consultantId: string
    ): Promise<IConsultation> {
        try {
            // Validate consultation exists
            const consultation = await ConsultationSchema.findById(consultationId);
            if (!consultation) {
                throw new HttpException(HttpStatus.NotFound, 'Consultation not found');
            }

            // Validate consultant exists and has correct role
            const consultant = await UserSchema.findOne({
                _id: consultantId,
                role: { $in: [UserRoleEnum.STAFF, UserRoleEnum.MANAGER] }
            });
            if (!consultant) {
                throw new HttpException(HttpStatus.NotFound, 'Consultant not found or invalid role');
            }

            // Update consultation
            const updatedConsultation = await ConsultationSchema.findByIdAndUpdate(
                consultationId,
                {
                    assigned_consultant_id: consultantId,
                    consultation_status: ConsultationStatusEnum.ASSIGNED,
                    updated_at: new Date()
                },
                { new: true, populate: { path: 'assigned_consultant_id', select: 'first_name last_name email' } }
            );

            if (!updatedConsultation) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to assign consultant');
            }

            // Note: Consultation logging will be handled separately

            // Send notification emails
            try {
                await this.sendConsultationAssignmentEmail(updatedConsultation);
            } catch (emailError) {
                console.error('Failed to send consultation assignment email:', emailError);
            }

            return updatedConsultation;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error assigning consultant');
        }
    }

    /**
     * Update consultation status
     */
    public async updateConsultationStatus(
        consultationId: string,
        status: ConsultationStatusEnum,
        updateData?: {
            meeting_link?: string;
            meeting_notes?: string;
            follow_up_required?: boolean;
            follow_up_date?: Date;
            appointment_date?: Date;
        }
    ): Promise<IConsultation> {
        try {
            const consultation = await ConsultationSchema.findById(consultationId);
            if (!consultation) {
                throw new HttpException(HttpStatus.NotFound, 'Consultation not found');
            }

            const updateFields: any = {
                consultation_status: status,
                updated_at: new Date()
            };

            if (updateData) {
                Object.assign(updateFields, updateData);
            }

            //update appointment_date is date now
            updateFields.appointment_date = new Date();

            const updatedConsultation = await ConsultationSchema.findByIdAndUpdate(
                consultationId,
                updateFields,
                { new: true, populate: { path: 'assigned_consultant_id', select: 'first_name last_name email' } }
            );

            if (!updatedConsultation) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to update consultation status');
            }

            // Note: Consultation logging will be handled separately

            // Send status update email
            try {
                await this.sendConsultationStatusUpdateEmail(updatedConsultation);
            } catch (emailError) {
                console.error('Failed to send consultation status update email:', emailError);
            }

            return updatedConsultation;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error updating consultation status');
        }
    }

    /**
     * Get consultation by ID
     */
    public async getConsultationById(consultationId: string): Promise<IConsultation> {
        try {
            if (!mongoose.Types.ObjectId.isValid(consultationId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid consultation ID');
            }

            const consultation = await ConsultationSchema.findById(consultationId)
                .populate('assigned_consultant_id', 'first_name last_name email phone_number');

            if (!consultation) {
                throw new HttpException(HttpStatus.NotFound, 'Consultation not found');
            }

            return consultation;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting consultation');
        }
    }

    /**
     * Send consultation request confirmation email to customer
     */
    private async sendConsultationRequestEmail(consultation: IConsultation): Promise<void> {
        try {
            const customerName = `${consultation.first_name} ${consultation.last_name}`;
            const preferredDate = consultation.preferred_date
                ? new Date(consultation.preferred_date).toLocaleDateString()
                : 'Not specified';

            const title = 'Consultation Request Received';
            const message = `
                Thank you for your consultation request. We have received your inquiry and will get back to you soon.
                <br><br>
                <strong>Request Details:</strong>
                <br>
                Subject: ${consultation.subject}
                <br>
                Type: ${consultation.type}
                <br>
                Preferred Date: ${preferredDate}
                <br>
                Preferred Time: ${consultation.preferred_time || 'Not specified'}
                <br><br>
                Our team will review your request and assign a consultant to assist you. 
                You will receive another email once a consultant has been assigned.
                <br><br>
                Reference ID: ${consultation._id}
            `;

            const emailDetails: ISendMailDetail = {
                toMail: consultation.email,
                subject: 'Consultation Request Received - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(customerName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Consultation request email sent to ${consultation.email}`);
        } catch (error) {
            console.error('Error sending consultation request email:', error);
        }
    }

    /**
     * Send consultation notification to staff/admin
     */
    private async sendConsultationNotificationToStaff(consultation: IConsultation): Promise<void> {
        try {
            // Get admin and department manager emails
            const adminUsers = await UserSchema.find({
                role: { $in: [UserRoleEnum.ADMIN, UserRoleEnum.MANAGER] }
            }).select('email first_name last_name');

            const customerName = `${consultation.first_name} ${consultation.last_name}`;
            const title = 'New Consultation Request';
            const message = `
                A new consultation request has been submitted.
                <br><br>
                <strong>Customer Details:</strong>
                <br>
                Name: ${customerName}
                <br>
                Email: ${consultation.email}
                <br>
                Phone: ${consultation.phone_number}
                <br><br>
                <strong>Request Details:</strong>
                <br>
                Subject: ${consultation.subject}
                <br>
                Type: ${consultation.type}
                <br>
                Preferred Date: ${consultation.preferred_date ? new Date(consultation.preferred_date).toLocaleDateString() : 'Not specified'}
                <br>
                Notes: ${consultation.consultation_notes || 'None'}
                <br><br>
                Please assign a consultant to handle this request.
                <br><br>
                Reference ID: ${consultation._id}
            `;

            // Send to all admins and managers
            for (const admin of adminUsers) {
                if (admin.email) {
                    const adminName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || admin.email;
                    const emailDetails: ISendMailDetail = {
                        toMail: admin.email,
                        subject: 'New Consultation Request - Bloodline DNA Testing Service',
                        html: createNotificationEmailTemplate(adminName, title, message)
                    };

                    await sendMail(emailDetails);
                }
            }

            console.log(`Consultation notification sent to ${adminUsers.length} staff members`);
        } catch (error) {
            console.error('Error sending consultation notification to staff:', error);
        }
    }

    /**
     * Send consultation assignment email
     */
    private async sendConsultationAssignmentEmail(consultation: IConsultation): Promise<void> {
        try {
            const customerName = `${consultation.first_name} ${consultation.last_name}`;
            const consultant = consultation.assigned_consultant_id as any;
            const consultantName = consultant ? `${consultant.first_name} ${consultant.last_name}` : 'Our team';

            const title = 'Consultant Assigned to Your Request';
            const message = `
                Good news! A consultant has been assigned to handle your consultation request.
                <br><br>
                <strong>Assigned Consultant:</strong> ${consultantName}
                <br><br>
                <strong>Your Request Details:</strong>
                <br>
                Subject: ${consultation.subject}
                <br>
                Type: ${consultation.type}
                <br>
                Reference ID: ${consultation._id}
                <br><br>
                Your consultant will contact you soon to schedule the consultation session.
                <br><br>
                If you have any urgent questions, please don't hesitate to contact us.
            `;

            const emailDetails: ISendMailDetail = {
                toMail: consultation.email,
                subject: 'Consultant Assigned - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(customerName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Consultation assignment email sent to ${consultation.email}`);
        } catch (error) {
            console.error('Error sending consultation assignment email:', error);
        }
    }

    /**
     * Send consultation status update email
     */
    private async sendConsultationStatusUpdateEmail(consultation: IConsultation): Promise<void> {
        try {
            const customerName = `${consultation.first_name} ${consultation.last_name}`;
            let title = 'Consultation Status Update';
            let message = `
                Your consultation request status has been updated.
                <br><br>
                <strong>Current Status:</strong> ${consultation.consultation_status}
                <br>
                <strong>Reference ID:</strong> ${consultation._id}
                <br><br>
            `;

            // Add specific messages based on status
            switch (consultation.consultation_status) {
                case ConsultationStatusEnum.SCHEDULED:
                    title = 'Consultation Scheduled';
                    if (consultation.appointment_date) {
                        message += `Your consultation has been scheduled for ${new Date(consultation.appointment_date).toLocaleString()}.<br><br>`;
                    }
                    if (consultation.meeting_link) {
                        message += `Meeting Link: ${consultation.meeting_link}<br><br>`;
                    }
                    message += 'Please make sure to be available at the scheduled time.';
                    break;
                case ConsultationStatusEnum.COMPLETED:
                    title = 'Consultation Completed';
                    message += 'Your consultation has been completed. Thank you for choosing our services.<br><br>';
                    if (consultation.follow_up_required && consultation.follow_up_date) {
                        message += `A follow-up session has been scheduled for ${new Date(consultation.follow_up_date).toLocaleDateString()}.`;
                    }
                    break;
                case ConsultationStatusEnum.CANCELLED:
                    title = 'Consultation Cancelled';
                    message += 'Your consultation has been cancelled. If you did not request this cancellation or have any questions, please contact us.';
                    break;
                case ConsultationStatusEnum.FOLLOW_UP_REQUIRED:
                    title = 'Follow-up Required';
                    message += 'Based on your consultation, a follow-up session is required. Our consultant will contact you to schedule this.';
                    break;
                default:
                    message += 'If you have any questions about your consultation, please contact us.';
            }

            const emailDetails: ISendMailDetail = {
                toMail: consultation.email,
                subject: `${title} - Bloodline DNA Testing Service`,
                html: createNotificationEmailTemplate(customerName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Consultation status update email sent to ${consultation.email}`);
        } catch (error) {
            console.error('Error sending consultation status update email:', error);
        }
    }

    /**
     * Create a new appointment
     */
    public async createAppointment(userId: string, appointmentData: CreateAppointmentDto): Promise<IAppointment> {
        let appointment: IAppointment | null = null;
        let service: any = null;
        let slot: any = null;
        let staffId: any = null;
        let administrative_case_id: string | undefined;

        try {
            service = await ServiceSchema.findById(appointmentData.service_id);
            if (!service) {
                throw new HttpException(HttpStatus.NotFound, 'Service not found');
            }

            // ADMINISTRATIVE logic
            if (service.type === ServiceTypeEnum.ADMINISTRATIVE) {
                // Validate
                if (!appointmentData.case_number || !appointmentData.authorization_code) {
                    throw new HttpException(HttpStatus.BadRequest, 'case_number and authorization_code are required for ADMINISTRATIVE service');
                }
                // Chỉ tìm administrative_case, không được tạo mới
                const adminCase = await AdministrativeCaseSchema.findOne({
                    case_number: appointmentData.case_number,
                    authorization_code: appointmentData.authorization_code
                });
                if (!adminCase) {
                    throw new HttpException(HttpStatus.NotFound, 'Administrative case not found or invalid');
                }
                administrative_case_id = (adminCase._id as any).toString();
                // Ép type = FACILITY
                appointmentData.type = TypeEnum.FACILITY;
                // Set agency_contact_email from administrative case
                appointmentData.agency_contact_email = adminCase.agency_contact_email;
            }

            // Nếu có slot_id, kiểm tra slot và lấy staff_id
            if (appointmentData.slot_id) {
                slot = await SlotSchema.findById(appointmentData.slot_id);
                if (!slot) {
                    throw new HttpException(HttpStatus.NotFound, 'Slot not found');
                }

                // Kiểm tra xem slot có khả dụng không
                if (slot.status !== SlotStatusEnum.AVAILABLE) {
                    throw new HttpException(HttpStatus.BadRequest, 'Slot is not available');
                }

                // Lấy staff profile từ slot
                if (slot.staff_profile_ids && slot.staff_profile_ids.length > 0) {
                    const staffProfile = await StaffProfileSchema.findById(slot.staff_profile_ids[0]);
                    if (staffProfile) {
                        // Lấy user ID từ staff profile
                        const staffUser = await UserSchema.findOne({ _id: staffProfile.user_id });
                        if (staffUser) {
                            staffId = staffUser._id;
                        }
                    }
                }

                // Nếu không có ngày appointment, sử dụng ngày từ slot entity
                if (!appointmentData.appointment_date) {
                    // set the appointment date to the slot's date
                    appointmentData.appointment_date = new Date(
                        slot?.time_slots?.[0]?.year ?? new Date().getFullYear(),
                        (slot?.time_slots?.[0]?.month ?? new Date().getMonth() + 1) - 1,
                        slot?.time_slots?.[0]?.day ?? new Date().getDate()
                    );

                    // set the appointment time to the slot's start time
                    if (slot?.time_slots?.[0]?.start_time) {
                        appointmentData.appointment_date.setHours(
                            slot.time_slots[0].start_time.hour,
                            slot.time_slots[0].start_time.minute,
                            0, 0
                        );
                    }
                }

            } else if (!appointmentData.appointment_date) {
                appointmentData.appointment_date = new Date();
            }

            // Đối với dịch vụ thu thập tại nhà, địa chỉ thu thập là bắt buộc
            if (appointmentData.type === TypeEnum.HOME && !appointmentData.collection_address) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'Collection address is required for home collection'
                );
            }

            // Validate address for HOME appointments - only support TP. HCM, Việt Nam
            if (appointmentData.type === TypeEnum.HOME && appointmentData.collection_address) {
                const isValidAddress = this.validateServiceArea(appointmentData.collection_address);
                if (!isValidAddress) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        'Home collection service is only available in Ho Chi Minh City, Vietnam. Please contact us for other locations.'
                    );
                }
            }

            // ==================== NEW VALIDATION & SURCHARGE FOR HOME COLLECTION ====================
            let totalAmount = service.price;
            // Determine the intended appointment date/time for pricing
            const dateToCheck = appointmentData.appointment_date ?? new Date();
            const checkHour = dateToCheck.getHours();
            const checkDay = dateToCheck.getDay(); // 0 = Sun, 6 = Sat

            // Kiểm tra có phải ngoài giờ hành chính không (8h00-17h00 Thứ 2 ➜ Thứ 6)
            const isWithinBusinessHours =
                checkHour >= BUSINESS_HOURS_START &&
                checkHour < BUSINESS_HOURS_END &&
                checkDay >= 1 &&
                checkDay <= 5;

            // Nếu NGOÀI giờ hành chính → áp dụng phụ phí
            if (!isWithinBusinessHours) {
                totalAmount = Math.round(service.price * (1 + HOME_SERVICE_SURCHARGE_PERCENTAGE));
            }
            // Nếu TRONG giờ hành chính → giá bình thường (không thay đổi totalAmount)
            // ==========================================================================================

            // Tạo appointment với staff_id nếu có
            appointment = await this.appointmentRepository.create({
                user_id: userId as any,
                service_id: appointmentData.service_id as any,
                slot_id: appointmentData.slot_id as any,
                staff_id: staffId as any, // Thêm staff_id nếu có
                appointment_date: new Date(appointmentData.appointment_date),
                type: appointmentData.type,
                collection_address: appointmentData.collection_address,
                status: AppointmentStatusEnum.PENDING,
                payment_status: service.type === ServiceTypeEnum.ADMINISTRATIVE ? PaymentStatusEnum.PAID : PaymentStatusEnum.UNPAID,
                payment_stage: AppointmentPaymentStageEnum.UNPAID, // Trạng thái thanh toán của cuộc hẹn
                total_amount: totalAmount, // Tổng số tiền của dịch vụ (đã áp dụng phụ phí nếu có)
                deposit_amount: Math.round(totalAmount * 0.3), // Số tiền đặt cọc (30%)
                amount_paid: 0, // Số tiền đã thanh toán
                administrative_case_id,
                agency_contact_email: service.type === ServiceTypeEnum.ADMINISTRATIVE ? appointmentData.agency_contact_email : undefined,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Nếu là ADMINISTRATIVE, tạo payment PAID, amount=0, method=GOVERNMENT
            if (service.type === ServiceTypeEnum.ADMINISTRATIVE) {
                try {
                    const paymentService = new PaymentService();
                    await paymentService.createAdministrativePayment(appointment._id.toString(), userId);
                } catch (paymentError) {
                    // Nếu lỗi khi tạo payment cho ADMINISTRATIVE, log lỗi nhưng KHÔNG throw 500
                    console.error('Failed to create administrative payment:', paymentError);
                    // Có thể thêm thông tin vào appointment để trả về cho client biết payment chưa được tạo
                    (appointment as any).paymentError = 'Failed to create administrative payment. Please contact support.';
                }
            }

            // Chỉ cập nhật status slot sau khi appointment được tạo thành công
            if (appointmentData.slot_id && slot) {
                // Atomically increment assigned_count
                const updatedSlot = await SlotSchema.findByIdAndUpdate(
                    appointmentData.slot_id,
                    { $inc: { assigned_count: 1 } }, // $inc ~ increment
                    { new: true }
                );
                if (!updatedSlot) {
                    throw new HttpException(HttpStatus.InternalServerError, 'Failed to update slot');
                }

                // If assigned_count reaches appointment_limit, set status to BOOKED
                if (updatedSlot && updatedSlot.assigned_count !== undefined && updatedSlot.assigned_count >= updatedSlot.appointment_limit) {
                    await SlotSchema.findByIdAndUpdate(
                        appointmentData.slot_id,
                        { status: SlotStatusEnum.BOOKED },
                        { new: true }
                    );
                } else if (updatedSlot.status !== SlotStatusEnum.AVAILABLE) {
                    // If not yet full, ensure status is AVAILABLE
                    await SlotSchema.findByIdAndUpdate(
                        appointmentData.slot_id,
                        { status: SlotStatusEnum.AVAILABLE },
                        { new: true }
                    );
                }
            }

            // tạo mẫu cho appointment nếu có mẫu được cung cấp
            if (appointmentData.samples && appointmentData.samples.length > 0) {
                console.log(`Sample types provided with appointment creation. These will be ignored.`);
                console.log(`Please use the /api/sample/add-to-appointment endpoint to add samples to this appointment.`);

                // Thêm thông tin hướng dẫn vào response
                (appointment as any).sampleInstructions =
                    "Please use the /api/sample/add-to-appointment endpoint to add samples to this appointment.";
            }

            // Log sự kiện tạo appointment
            try {
                await this.appointmentLogService.logAppointmentCreation(appointment, userId, 'CUSTOMER');
            } catch (logError) {
                console.error('Failed to create appointment log:', logError);
            }

            // Send email notification to user
            try {
                await this.sendAppointmentCreationEmail(appointment);
            } catch (emailError) {
                console.error('Failed to send appointment creation email:', emailError);
            }

            return appointment;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            // Nếu là ADMINISTRATIVE thì không trả về 500 mà trả về 200 với appointment đã tạo (nếu có)
            if (
                service &&
                service.type === ServiceTypeEnum.ADMINISTRATIVE &&
                appointment
            ) {
                // Log the error
                console.error('Error after creating ADMINISTRATIVE appointment:', error);
                // Có thể thêm thông tin lỗi vào appointment để client biết
                (appointment as any).creationError = 'An error occurred after appointment creation. Please contact support.';
                return appointment;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating appointment');
        }
    }

    /**
     * Get appointment by ID
     */
    public async getAppointmentById(id: string): Promise<IAppointment> {
        try {
            if (!id) {
                throw new HttpException(HttpStatus.BadRequest, 'Appointment ID is required');
            }

            // Check if the id is a JSON string representation of an appointment object
            if (id.includes('_id') && id.includes('ObjectId')) {
                console.log('Received appointment object as string instead of ID:', id);

                // Try to extract the _id from the string
                try {
                    // Extract the ObjectId value using regex
                    const match = id.match(/ObjectId\('([^']+)'\)/);
                    if (match && match[1]) {
                        id = match[1];
                        console.log('Extracted ID from object string:', id);
                    } else {
                        throw new HttpException(
                            HttpStatus.BadRequest,
                            'Invalid appointment ID format: could not extract ObjectId'
                        );
                    }
                } catch (parseError) {
                    console.error('Error parsing appointment object string:', parseError);
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        'Invalid appointment ID format: not a valid ObjectId or appointment object'
                    );
                }
            }

            // Convert string ID to ObjectId if needed
            let objectId = id;
            if (typeof id === 'string') {
                try {
                    if (mongoose.Types.ObjectId.isValid(id)) {
                        objectId = new mongoose.Types.ObjectId(id).toString();
                    } else {
                        throw new HttpException(
                            HttpStatus.BadRequest,
                            `Invalid appointment ID format: ${id} is not a valid ObjectId`
                        );
                    }
                } catch (error: any) {
                    console.error(`Error converting appointment ID ${id} to ObjectId:`, error);
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        `Invalid appointment ID format: ${error.message}`
                    );
                }
            }

            const appointment = await this.appointmentRepository.findByIdWithPopulate(objectId);
            if (!appointment) {
                throw new HttpException(HttpStatus.NotFound, `Appointment not found with ID: ${id}`);
            }

            return appointment;
        } catch (error: any) {
            console.error(`Error in getAppointmentById for ID ${id}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, `Error getting appointment: ${error.message}`);
        }
    }

    /**
     * Assign staff to an appointment (by department manager)
     */
    public async assignStaff(
        appointmentId: string,
        assignStaffData: AssignStaffDto,
    ): Promise<IAppointment> {
        // Kiểm tra appointment có tồn tại và trạng thái là PENDING
        const appointment = await this.getAppointmentById(appointmentId);
        if (appointment.status !== AppointmentStatusEnum.PENDING) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `Cannot assign staff to appointment with status ${appointment.status}`
            );
        }

        // Validate staff IDs
        if (!assignStaffData.staff_ids || assignStaffData.staff_ids.length === 0) {
            throw new HttpException(HttpStatus.BadRequest, 'At least one staff ID is required');
        }

        // Validate all staff IDs
        for (const staffId of assignStaffData.staff_ids) {
            if (!mongoose.Types.ObjectId.isValid(staffId)) {
                throw new HttpException(HttpStatus.BadRequest, `Invalid staff ID: ${staffId}`);
            }
        }

        // Lấy thông tin user cho tất cả staff
        const staffUsers = await UserSchema.find({
            _id: { $in: assignStaffData.staff_ids },
            role: UserRoleEnum.STAFF
        });

        if (staffUsers.length !== assignStaffData.staff_ids.length) {
            throw new HttpException(HttpStatus.NotFound, 'One or more staff users not found');
        }

        // Kiểm tra staff profile liên kết với user
        const staffProfiles = await StaffProfileSchema.find({
            user_id: { $in: assignStaffData.staff_ids }
        });

        if (staffProfiles.length !== assignStaffData.staff_ids.length) {
            throw new HttpException(
                HttpStatus.NotFound,
                'One or more staff profiles not found'
            );
        }

        // Kiểm tra tất cả staff có active không
        for (const profile of staffProfiles) {
            if (profile.status !== StaffStatusEnum.ACTIVE) {
                const staffUser = staffUsers.find(u => u._id.toString() === profile.user_id?.toString());
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Staff ${staffUser?.first_name} ${staffUser?.last_name} is not active`
                );
            }
        }

        // Kiểm tra slot nếu có
        if (appointment.slot_id) {
            const slot = await SlotSchema.findById(appointment.slot_id);
            if (slot) {
                // Kiểm tra xem tất cả staff có trong danh sách staff của slot không
                const slotStaffProfileIds = slot.staff_profile_ids?.map(id => id.toString()) || [];
                const assignedStaffProfileIds = staffProfiles.map(profile => profile._id.toString());

                const missingStaff = assignedStaffProfileIds.filter(id => !slotStaffProfileIds.includes(id));
                if (missingStaff.length > 0) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        'One or more staff are not assigned to this slot'
                    );
                }

                // Kiểm tra giới hạn số lượng appointment cho tất cả staff trong slot này
                for (const staffUser of staffUsers) {
                    const appointmentsInSlot = await this.appointmentRepository.countAppointmentsByStaffAndSlot(
                        staffUser._id.toString(),
                        slot._id.toString()
                    );

                    if (appointmentsInSlot >= slot.appointment_limit) {
                        // Tìm staff khác trong slot chưa đạt giới hạn
                        const alternativeStaff = await this.findAvailableStaffInSlot(slot);

                        if (alternativeStaff) {
                            // Gợi ý staff thay thế
                            throw new HttpException(
                                HttpStatus.BadRequest,
                                `Staff ${staffUser.first_name} ${staffUser.last_name} has reached appointment limit for this slot. Consider assigning to ${alternativeStaff.first_name} ${alternativeStaff.last_name} (ID: ${alternativeStaff._id})`
                            );
                        } else {
                            throw new HttpException(
                                HttpStatus.BadRequest,
                                `Staff ${staffUser.first_name} ${staffUser.last_name} has reached appointment limit for this slot and no alternative staff is available`
                            );
                        }
                    }
                }

                // Cập nhật thông tin slot nếu cần
                try {
                    // Kiểm tra xem slot có đang theo dõi số lượng appointment đã gán không
                    if (!slot.assigned_count) {
                        // Nếu không có trường assigned_count, thêm vào và đặt giá trị là 1
                        await SlotSchema.findByIdAndUpdate(
                            slot._id,
                            {
                                $set: { assigned_count: 1 },
                                updated_at: new Date()
                            },
                            { new: true }
                        );
                    } else {
                        // Nếu đã có trường assigned_count, tăng giá trị lên 1
                        await SlotSchema.findByIdAndUpdate(
                            slot._id,
                            {
                                $inc: { assigned_count: 1 }, // $inc ~ increment
                                updated_at: new Date()
                            },
                            { new: true }
                        );
                    }

                    // Nếu số lượng đã gán bằng với giới hạn, đánh dấu slot là BOOKED
                    const updatedSlot = await SlotSchema.findById(slot._id);
                    if (updatedSlot && updatedSlot?.assigned_count && updatedSlot?.assigned_count >= updatedSlot?.appointment_limit) {
                        await SlotSchema.findByIdAndUpdate(
                            slot._id,
                            {
                                status: SlotStatusEnum.BOOKED,
                                updated_at: new Date()
                            },
                            { new: true }
                        );
                    } else if (updatedSlot && updatedSlot?.status !== SlotStatusEnum.AVAILABLE) {
                        // Nếu chưa đạt giới hạn nhưng slot không ở trạng thái AVAILABLE, đặt lại trạng thái
                        await SlotSchema.findByIdAndUpdate(
                            slot._id,
                            {
                                status: SlotStatusEnum.AVAILABLE,
                                updated_at: new Date()
                            },
                            { new: true }
                        );
                    }
                } catch (error) {
                    console.error('Failed to update slot assigned count:', error);
                    // Không fail quá trình gán staff nếu cập nhật slot thất bại
                }
            }
        }

        // Cập nhật appointment với array của user IDs
        const oldStatus = appointment.status;
        const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(
            appointmentId,
            {
                staff_id: assignStaffData.staff_ids as any,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedAppointment) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to assign staff to appointment');
        }

        // Log sự kiện gán nhân viên
        try {
            await this.appointmentLogService.logStaffAssignment(
                updatedAppointment,
                assignStaffData.staff_ids,
                'system', // performed by system/manager
                UserRoleEnum.MANAGER
            );
        } catch (logError) {
            console.error('Failed to create appointment log for staff assignment:', logError);
        }

        return updatedAppointment;
    }

    /**
     * Find available staff in a slot that hasn't reached appointment limit
     */
    private async findAvailableStaffInSlot(slot: any): Promise<any> {
        // Lấy danh sách staff profile từ slot
        const staffProfileIds = slot.staff_profile_ids;
        if (!staffProfileIds || staffProfileIds.length === 0) {
            return null;
        }

        // Lấy thông tin staff profile
        const staffProfiles = await StaffProfileSchema.find({
            _id: { $in: staffProfileIds },
            status: StaffStatusEnum.ACTIVE
        });

        // Lấy user_id từ staff profile
        const staffUserIds = staffProfiles.map(profile => profile.user_id);

        // Lấy thông tin user
        const staffUsers = await UserSchema.find({
            _id: { $in: staffUserIds },
            role: UserRoleEnum.STAFF
        });

        // Kiểm tra số lượng appointment của mỗi staff trong slot này
        for (const staffUser of staffUsers) {
            const appointmentsCount = await this.appointmentRepository.countAppointmentsByStaffAndSlot(
                staffUser._id.toString(),
                slot._id.toString()
            );

            if (appointmentsCount < slot.appointment_limit) {
                return staffUser; // Trả về staff đầu tiên chưa đạt giới hạn
            }
        }

        return null; // Không tìm thấy staff nào có thể nhận thêm appointment
    }

    /**
     * Confirm appointment by selecting a slot (by staff)
     */
    public async confirmAppointment(
        appointmentId: string,
        confirmData: ConfirmAppointmentDto,
        staffId: string,
        userRole: UserRoleEnum
    ): Promise<IAppointment | undefined> {
        const appointment = await this.getAppointmentById(appointmentId);

        // Only staff can confirm appointments
        if (userRole !== UserRoleEnum.STAFF) {
            throw new HttpException(HttpStatus.Forbidden, 'Only staff can confirm appointments');
        }

        // Check if staff is assigned to the appointment
        if (!appointment.staff_id) {
            throw new HttpException(
                HttpStatus.BadRequest,
                'No staff assigned to this appointment yet. Department manager must assign staff first.'
            );
        }

        // Check if the appointment is in PENDING status
        if (appointment.status !== AppointmentStatusEnum.PENDING) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `Cannot confirm appointment with status ${appointment.status}`
            );
        }

        // Check if the assigned staff matches the confirming staff
        const staffProfile = await StaffProfileSchema.findOne({ user_id: staffId });
        if (!staffProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found');
        }

        const appointmentStaff = await UserSchema.findById(appointment.staff_id);
        if (!appointmentStaff) {
            throw new HttpException(HttpStatus.NotFound, 'Assigned staff not found');
        }

        if (appointmentStaff._id.toString() !== staffId) {
            throw new HttpException(
                HttpStatus.Forbidden,
                'You are not assigned to this appointment'
            );
        }

        // Validate slot
        const slot = await SlotSchema.findById(confirmData.slot_id);
        if (!slot) {
            throw new HttpException(HttpStatus.NotFound, 'Slot not found');
        }

        if (slot.status !== SlotStatusEnum.AVAILABLE) {
            throw new HttpException(HttpStatus.BadRequest, 'Slot is not available');
        }

        // Update appointment with new slot and status
        const oldStatus = appointment.status;
        const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(
            appointmentId,
            {
                slot_id: confirmData.slot_id as any,
                status: AppointmentStatusEnum.CONFIRMED,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedAppointment) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to confirm appointment');
        }

        // // Update slot status to BOOKED
        // await SlotSchema.findByIdAndUpdate(
        //     confirmData.slot_id,
        //     { status: SlotStatusEnum.BOOKED },
        //     { new: true }
        // );

        // Cập nhật thông tin slot nếu cần
        try {
            // Kiểm tra xem slot có đang theo dõi số lượng appointment đã gán không
            if (!slot.assigned_count) {
                // Nếu không có trường assigned_count, thêm vào và đặt giá trị là 1
                await SlotSchema.findByIdAndUpdate(
                    slot._id,
                    {
                        $set: { assigned_count: 1 },
                        updated_at: new Date()
                    },
                    { new: true }
                );
            } else {
                // Nếu đã có trường assigned_count, tăng giá trị lên 1
                await SlotSchema.findByIdAndUpdate(
                    slot._id,
                    {
                        $inc: { assigned_count: 1 }, // $inc ~ increment
                        updated_at: new Date()
                    },
                    { new: true }
                );
            }

            // Nếu số lượng đã gán bằng với giới hạn, đánh dấu slot là BOOKED
            const updatedSlot = await SlotSchema.findById(slot._id);
            if (updatedSlot && updatedSlot?.assigned_count && updatedSlot?.assigned_count >= updatedSlot?.appointment_limit) {
                await SlotSchema.findByIdAndUpdate(
                    slot._id,
                    {
                        status: SlotStatusEnum.BOOKED,
                        updated_at: new Date()
                    },
                    { new: true }
                );
            } else if (updatedSlot && updatedSlot?.status !== SlotStatusEnum.AVAILABLE) {
                // Nếu chưa đạt giới hạn nhưng slot không ở trạng thái AVAILABLE, đặt lại trạng thái
                await SlotSchema.findByIdAndUpdate(
                    slot._id,
                    {
                        status: SlotStatusEnum.AVAILABLE,
                        updated_at: new Date()
                    },
                    { new: true }
                );
            }

            // Log the confirmation
            try {
                await this.appointmentLogService.logStatusUpdate(
                    updatedAppointment,
                    this.convertStatusToLogType(oldStatus),
                    this.convertStatusToLogType(updatedAppointment.status),
                    staffId,
                    UserRoleEnum.STAFF,
                    'Appointment confirmed by staff'
                );
            } catch (logError) {
                console.error('Failed to create appointment log for confirmation:', logError);
            }

            // Send confirmation email to user
            try {
                await this.sendAppointmentConfirmationEmail(updatedAppointment);
            } catch (emailError) {
                console.error('Failed to send appointment confirmation email:', emailError);
            }

            return updatedAppointment;
        }
        catch (error) {
            console.error('Failed to update slot assigned count:', error);
            // Không fail quá trình xác nhận nếu cập nhật slot thất bại
        }
    }

    /**
     * Checkin appointment
     */
    public async checkinAppointment(appointmentId: string, staffId: string, note?: string): Promise<IAppointment> {
        // Validate appointment and staff assignment
        const appointment = await this.getAppointmentById(appointmentId);
        if (typeof appointment.staff_id === 'string') {
            if (appointment.staff_id !== staffId) {
                throw new HttpException(HttpStatus.Forbidden, 'You are not assigned to this appointment');
            }
        } else {
            if (!appointment.staff_id) {
                throw new HttpException(HttpStatus.Forbidden, 'You are not assigned to this appointment');
            }
        }
        // Add check-in log
        const checkinLog = { staff_id: staffId, time: new Date(), note };
        const updated = await this.appointmentRepository.findByIdAndUpdate(
            appointmentId,
            { checkin_logs: [...(appointment.checkin_logs || []), checkinLog] },
            { new: true }
        );
        if (!updated) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to checkin appointment');
        }

        // Log the checkin
        try {
            await this.appointmentLogService.logCheckin(
                updated,
                staffId,
                UserRoleEnum.STAFF,
                note,
                appointment.collection_address
            );
        } catch (logError) {
            console.error('Failed to create appointment log for checkin:', logError);
        }

        return updated;
    }

    /**
     * Add appointment note
     */
    public async addAppointmentNote(appointmentId: string, note: string): Promise<IAppointment> {
        const appointment = await this.getAppointmentById(appointmentId);
        const updated = await this.appointmentRepository.findByIdAndUpdate(
            appointmentId,
            { notes: [...(appointment.notes || []), note] },
            { new: true }
        );
        if (!updated) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to add appointment note');
        }

        // Log the note addition
        try {
            await this.appointmentLogService.logNoteAddition(
                updated,
                note,
                'system', // Could be enhanced to track actual user
                UserRoleEnum.STAFF
            );
        } catch (logError) {
            console.error('Failed to create appointment log for note addition:', logError);
        }

        return updated;
    }

    /**
     * Search appointments with filters
     */
    public async searchAppointments(
        searchParams: SearchAppointmentDto,
        userRole: UserRoleEnum,
        userId?: string
    ): Promise<SearchPaginationResponseModel<IAppointment>> {
        try {
            // Process pagination parameters
            const pageNum = searchParams.pageNum || 1;
            const pageSize = searchParams.pageSize || 10;
            const skip = (pageNum - 1) * pageSize;

            // Build the query based on filters
            const query: any = {};

            // If user is a customer, they can only see their own appointments
            if (userRole === UserRoleEnum.CUSTOMER && userId) {
                query.user_id = new mongoose.Types.ObjectId(userId);
            }
            // If user is a staff, they can only see appointments assigned to them
            else if (userRole === UserRoleEnum.STAFF && userId) {
                query.staff_id = new mongoose.Types.ObjectId(userId);
            }
            // If user is a laboratory technician, they can only see appointments assigned to them
            else if (userRole === UserRoleEnum.LABORATORY_TECHNICIAN && userId) {
                query.laboratory_technician_id = new mongoose.Types.ObjectId(userId);
            }
            // For other roles, apply filters if provided
            else {
                if (searchParams.user_id) {
                    query.user_id = new mongoose.Types.ObjectId(searchParams.user_id);
                }

                if (searchParams.staff_id) {
                    query.staff_id = new mongoose.Types.ObjectId(searchParams.staff_id);
                }
            }

            // Apply common filters
            if (searchParams.service_id) {
                query.service_id = new mongoose.Types.ObjectId(searchParams.service_id);
            }

            if (searchParams.status) {
                query.status = searchParams.status;
            }

            if (searchParams.type) {
                query.type = searchParams.type;
            }

            // Date range filter
            if (searchParams.start_date || searchParams.end_date) {
                query.appointment_date = {};

                if (searchParams.start_date) {
                    query.appointment_date.$gte = new Date(searchParams.start_date);
                }

                if (searchParams.end_date) {
                    query.appointment_date.$lte = new Date(searchParams.end_date);
                }
            }

            // Handle search term differently based on type
            if (searchParams.search_term) {
                const searchRegex = new RegExp(searchParams.search_term, 'i');

                // If there's a search term, we'll search in collection_address if type is HOME
                if (searchParams.type === TypeEnum.HOME) {
                    query.collection_address = { $regex: searchRegex };
                } else {
                    // For non-HOME types, we need to search in user names
                    // This requires a different approach using aggregation or lookup
                    // For now, we'll handle this by fetching all results and filtering
                    // This is not ideal for large datasets but works for the current use case
                }
            }

            let appointments: IAppointment[] = [];
            let totalCount: number = 0;

            // If we have a search term for non-HOME types, we need to handle it differently
            if (searchParams.search_term && searchParams.type !== TypeEnum.HOME) {
                // Fetch all appointments matching the base query (without pagination)
                const allAppointments = await this.appointmentRepository.findWithPopulate(query);

                // Filter by search term
                const searchRegex = new RegExp(searchParams.search_term, 'i');
                const filteredAppointments = allAppointments.filter(appointment => {
                    const user = appointment.user_id as any;
                    if (user && (user.first_name || user.last_name)) {
                        const fullName = `${user.first_name || ''} ${user.last_name || ''}`;
                        return searchRegex.test(fullName);
                    }
                    return false;
                });

                // Calculate total count from filtered results
                totalCount = filteredAppointments.length;

                // Apply pagination to filtered results
                const startIndex = skip;
                const endIndex = startIndex + pageSize;
                appointments = filteredAppointments.slice(startIndex, endIndex);
            } else {
                // For HOME type searches or no search term, use normal pagination
                // Count total documents matching the query
                totalCount = await this.appointmentRepository.countDocuments(query);

                // Sort by appointment date (newest first)
                const sort = { appointment_date: -1 };

                // Fetch appointments with pagination
                appointments = await this.appointmentRepository.findWithPaginationAndPopulate(
                    query,
                    sort,
                    skip,
                    pageSize
                );
            }

            return {
                pageData: appointments,
                pageInfo: {
                    totalItems: totalCount,
                    pageNum,
                    pageSize,
                    totalPages: Math.ceil(totalCount / pageSize)
                }
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error searching appointments');
        }
    }

    /**
     * Process query parameters
     */
    private processQueryParams(queryParams: any): any {
        const { pageNum = 1, pageSize = 10, ...rest } = queryParams;
        return {
            pageNum: parseInt(pageNum),
            pageSize: parseInt(pageSize),
            ...rest
        };
    }

    /**
     * Update appointment status
     */
    public async updateAppointmentStatus(appointmentId: string, status: AppointmentStatusEnum): Promise<IAppointment> {
        // Validate appointmentId
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID');
        }

        // Find the appointment
        const appointment = await this.getAppointmentById(appointmentId);

        // Update appointment status
        const oldStatus = appointment.status;
        const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(
            appointmentId,
            {
                status: status,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedAppointment) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to update appointment status');
        }

        // Log the status change
        try {
            await this.appointmentLogService.logStatusChange(
                updatedAppointment,
                this.convertStatusToLogType(oldStatus),
                this.convertStatusToLogType(updatedAppointment.status),
                'system' // Could be enhanced to track actual user
            );
        } catch (logError) {
            console.error('Failed to create appointment log for status change:', logError);
        }

        // Send status update email to user
        try {
            await this.sendAppointmentStatusUpdateEmail(updatedAppointment, oldStatus);
        } catch (emailError) {
            console.error('Failed to send appointment status update email:', emailError);
        }

        return updatedAppointment;
    }

    /**
     * Get samples for an appointment
     */
    public async getAppointmentSamples(appointmentId: string): Promise<ISample[]> {
        // Validate appointment exists
        await this.getAppointmentById(appointmentId);

        // Get samples for the appointment
        const samples = await this.getSampleService().getSamplesByAppointmentId(appointmentId);
        return samples;
    }

    /**
     * Get price for an appointment
     * @param appointmentId The ID of the appointment
     * @returns The price of the service associated with the appointment
     */
    public async getAppointmentPrice(appointmentId: string): Promise<number> {
        try {
            if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID');
            }

            const appointment = await this.appointmentRepository.findById(appointmentId);
            if (!appointment) {
                throw new HttpException(HttpStatus.NotFound, 'Appointment not found');
            }

            const service = await ServiceSchema.findById(appointment.service_id);
            if (!service) {
                throw new HttpException(HttpStatus.NotFound, 'Service not found for this appointment');
            }

            return service.price;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting appointment price');
        }
    }

    /**
     * Get staff roles for department manager
     */
    public async getUserRoleStaff(address?: any, pageNum: number = 1, pageSize: number = 10): Promise<SearchPaginationResponseModel<any>> {
        try {
            // Build query for staff users
            const staffQuery: any = { role: { $in: [UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN] } };

            // Filter by address if provided
            if (address && typeof address === 'object') {
                Object.entries(address).forEach(([key, value]) => {
                    if (value) {
                        staffQuery[`address.${key}`] = { $regex: value, $options: 'i' };
                    }
                });
            }

            // Pagination
            const skip = (pageNum - 1) * pageSize;
            const totalItems = await UserSchema.countDocuments(staffQuery);
            const staffUsers = await UserSchema.find(staffQuery)
                .select('_id first_name last_name email phone_number address role')
                .skip(skip)
                .limit(pageSize)
                .lean();

            // Get staff profiles for these users
            const userIds = staffUsers.map(user => user._id);
            const staffProfiles = await StaffProfileSchema.find({
                user_id: { $in: userIds },
                status: StaffStatusEnum.ACTIVE
            }).select('user_id status department').lean();

            // Combine user and profile information
            const staffWithRoles = staffUsers.map(user => {
                const profile = staffProfiles.find(p => p.user_id?.toString() === user._id.toString());
                if (!profile) return null;
                return {
                    ...user,
                    staff_profile: {
                        status: profile.status,
                        department: profile.department_id
                    }
                };
            }).filter(Boolean);

            return {
                pageData: staffWithRoles,
                pageInfo: {
                    totalItems,
                    pageNum,
                    pageSize,
                    totalPages: Math.ceil(totalItems / pageSize)
                }
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting staff roles');
        }
    }

    /**
     * Get available slots for logged-in staff
     */
    public async getStaffAvailableSlots(staffId: string): Promise<any[]> {
        try {
            // Get staff profile
            const staffProfile = await StaffProfileSchema.findOne({ user_id: staffId });
            if (!staffProfile) {
                throw new HttpException(HttpStatus.NotFound, 'Staff profile not found');
            }

            // Get all slots assigned to this staff
            const slots = await SlotSchema.find({
                staff_profile_ids: { $in: [staffProfile._id] },
                status: SlotStatusEnum.AVAILABLE
            })

            return slots;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting staff available slots');
        }
    }

    /**
     * Get appointments assigned to a staff member
     */
    public async getStaffAssignedAppointments(
        staffId: string,
        searchParams: SearchAppointmentDto
    ): Promise<SearchPaginationResponseModel<IAppointment>> {
        try {
            // staff_id will be automatically set by role-based filtering in searchAppointments
            return this.searchAppointments(searchParams, UserRoleEnum.STAFF, staffId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting staff assigned appointments');
        }
    }

    /**
     * Get appointments assigned to a laboratory technician in appointment collection
     */
    /**
     * Get appointments assigned to a laboratory technician
     */
    public async getLabTechAssignedAppointments(
        labTechId: string,
        searchParams: SearchAppointmentDto
    ): Promise<SearchPaginationResponseModel<IAppointment>> {
        try {
            // laboratory_technician_id will be automatically set by role-based filtering in searchAppointments
            return this.searchAppointments(searchParams, UserRoleEnum.LABORATORY_TECHNICIAN, labTechId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting laboratory technician assigned appointments');
        }
    }

    /**
     * Assign laboratory technician to an appointment
     */
    public async assignLabTechnician(
        appointmentId: string,
        labTechId: string
    ): Promise<IAppointment> {
        try {
            // Validate appointment exists
            const appointment = await this.getAppointmentById(appointmentId);
            if (!appointment) {
                throw new HttpException(HttpStatus.NotFound, 'Appointment not found');
            }

            // Validate lab technician exists and has correct role
            const labTech = await UserSchema.findOne({
                _id: labTechId,
                role: UserRoleEnum.LABORATORY_TECHNICIAN
            });
            if (!labTech) {
                throw new HttpException(HttpStatus.NotFound, 'Laboratory technician not found');
            }

            // Update appointment with lab technician
            const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(
                appointmentId,
                {
                    laboratory_technician_id: labTechId,
                    updated_at: new Date()
                },
                { new: true }
            );

            if (!updatedAppointment) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to assign laboratory technician');
            }

            // Log the assignment
            try {
                await this.appointmentLogService.logLabTechAssignment(
                    updatedAppointment,
                    labTechId,
                    'system', // Could be enhanced to track actual user
                    UserRoleEnum.STAFF
                );
            } catch (logError) {
                console.error('Failed to create appointment log for lab tech assignment:', logError);
            }

            return updatedAppointment;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error assigning laboratory technician');
        }
    }

    /**
     * Get available laboratory technicians
     */
    public async getAvailableLabTechnicians(): Promise<any[]> {
        try {
            // Get all laboratory technician users
            const labTechUsers = await UserSchema.find({ role: UserRoleEnum.LABORATORY_TECHNICIAN })
                .select('_id first_name last_name email phone_number');

            // Get staff profiles for these users
            const labTechProfiles = await StaffProfileSchema.find({
                user_id: { $in: labTechUsers.map(user => user._id) },
                status: StaffStatusEnum.ACTIVE
            }).select('user_id status department');

            // Only include users who have a staff profile
            const availableLabTechs = labTechUsers
                .map(user => {
                    const profile = labTechProfiles.find(p => p.user_id?.toString() === user._id.toString());
                    if (!profile) return null;

                    return {
                        ...user.toObject(),
                        staff_profile: {
                            status: profile.status,
                            department: profile.department_id
                        }
                    };
                })
                .filter(tech => tech !== null);

            return availableLabTechs;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting available laboratory technicians');
        }
    }

    /**
     * Unassign staff from an appointment
     * This method is used when you need to change the assigned staff
     * or when an appointment is cancelled
     */
    public async unassignStaff(appointmentId: string): Promise<IAppointment> {
        // Kiểm tra appointment có tồn tại
        const appointment = await this.getAppointmentById(appointmentId);

        // Nếu không có staff_id hoặc slot_id, không cần xử lý
        if (!appointment.staff_id || !appointment.slot_id) {
            return appointment;
        }

        // Cập nhật slot để giảm assigned_count
        try {
            const slot = await SlotSchema.findById(appointment.slot_id);
            if (slot) {
                // Giảm assigned_count nếu có
                if (slot.assigned_count && slot.assigned_count > 0) {
                    await SlotSchema.findByIdAndUpdate(
                        slot._id,
                        {
                            $inc: { assigned_count: -1 },
                            updated_at: new Date()
                        },
                        { new: true }
                    );
                }

                // Nếu slot đang ở trạng thái BOOKED và assigned_count < appointment_limit
                // thì đặt lại trạng thái là AVAILABLE
                const updatedSlot = await SlotSchema.findById(slot._id);
                const assignedCount = updatedSlot?.assigned_count || 0;
                const appointmentLimit = updatedSlot?.appointment_limit || 1;
                if (updatedSlot &&
                    updatedSlot.status === SlotStatusEnum.BOOKED &&
                    assignedCount < appointmentLimit) {
                    await SlotSchema.findByIdAndUpdate(
                        slot._id,
                        {
                            status: SlotStatusEnum.AVAILABLE,
                            updated_at: new Date()
                        },
                        { new: true }
                    );
                }
            }
        } catch (error) {
            console.error('Failed to update slot assigned count during unassign:', error);
            // Không fail quá trình unassign nếu cập nhật slot thất bại
        }

        // Xóa staff_id khỏi appointment bằng cách sử dụng mongoose update operators
        const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(
            appointmentId,
            {
                // Sử dụng type assertion để tránh lỗi TypeScript
                staff_id: undefined as unknown as string,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedAppointment) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to unassign staff from appointment');
        }

        return updatedAppointment;
    }

    /**
     * Send email notification for appointment creation
     */
    private async sendAppointmentCreationEmail(appointment: IAppointment): Promise<void> {
        try {
            // Get user details
            const user = await UserSchema.findById(appointment.user_id);
            if (!user || !user.email) {
                console.error('Cannot send email: User not found or no email address');
                return;
            }

            // Get service details
            const service = await ServiceSchema.findById(appointment.service_id);
            if (!service) {
                console.error('Cannot send email: Service not found');
                return;
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
            const appointmentDate = appointment.appointment_date
                ? new Date(appointment.appointment_date).toLocaleString()
                : 'To be confirmed';

            const title = 'Appointment Created Successfully';
            const message = `
                Your appointment for ${service.name} has been created successfully.
                <br><br>
                <strong>Appointment Details:</strong>
                <br>
                Service: ${service.name}
                <br>
                Date: ${appointmentDate}
                <br>
                Type: ${appointment.type}
                <br>
                Status: ${appointment.status}
                <br><br>
                We will notify you once your appointment is confirmed by our staff.
            `;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: 'Appointment Created - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Appointment creation email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending appointment creation email:', error);
        }
    }

    /**
     * Send email notification for appointment confirmation
     */
    private async sendAppointmentConfirmationEmail(appointment: IAppointment): Promise<void> {
        try {
            // Get user details
            const user = await UserSchema.findById(appointment.user_id);
            if (!user || !user.email) {
                console.error('Cannot send email: User not found or no email address');
                return;
            }

            // Get service details
            const service = await ServiceSchema.findById(appointment.service_id);
            if (!service) {
                console.error('Cannot send email: Service not found');
                return;
            }

            // Get slot details if available
            let slotDetails = 'Not specified';
            if (appointment.slot_id) {
                const slot = await SlotSchema.findById(appointment.slot_id);
                if (slot && slot.time_slots && slot.time_slots.length > 0) {
                    const timeSlot = slot.time_slots[0];
                    const date = new Date(timeSlot.year, timeSlot.month - 1, timeSlot.day);
                    const formattedDate = date.toLocaleDateString();
                    const startTime = `${timeSlot.start_time.hour}:${timeSlot.start_time.minute.toString().padStart(2, '0')}`;
                    const endTime = `${timeSlot.end_time.hour}:${timeSlot.end_time.minute.toString().padStart(2, '0')}`;
                    slotDetails = `${formattedDate} from ${startTime} to ${endTime}`;
                }
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

            const title = 'Appointment Confirmed';
            const message = `
                Your appointment for ${service.name} has been confirmed.
                <br><br>
                <strong>Appointment Details:</strong>
                <br>
                Service: ${service.name}
                <br>
                Scheduled Time: ${slotDetails}
                <br>
                Type: ${appointment.type}
                <br>
                Status: ${appointment.status}
                <br><br>
                ${appointment.type === TypeEnum.HOME ?
                    `Our staff will visit your location at the scheduled time.` :
                    `Please arrive at our facility at the scheduled time.`}
                <br><br>
                If you need to reschedule or cancel your appointment, please contact us as soon as possible.
            `;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: 'Appointment Confirmed - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Appointment confirmation email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending appointment confirmation email:', error);
        }
    }

    /**
     * Send email notification for appointment status update
     */
    private async sendAppointmentStatusUpdateEmail(appointment: IAppointment, oldStatus: AppointmentStatusEnum): Promise<void> {
        try {
            // Get user details
            const user = await UserSchema.findById(appointment.user_id);
            if (!user || !user.email) {
                console.error('Cannot send email: User not found or no email address');
                return;
            }

            // Get service details
            const service = await ServiceSchema.findById(appointment.service_id);
            if (!service) {
                console.error('Cannot send email: Service not found');
                return;
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
            const appointmentDate = appointment.appointment_date
                ? new Date(appointment.appointment_date).toLocaleString()
                : 'To be confirmed';

            let title = 'Appointment Status Updated';
            let message = `
                Your appointment for ${service.name} has been updated from ${oldStatus} to ${appointment.status}.
                <br><br>
                <strong>Appointment Details:</strong>
                <br>
                Service: ${service.name}
                <br>
                Date: ${appointmentDate}
                <br>
                Type: ${appointment.type}
                <br>
                Status: ${appointment.status}
                <br><br>
            `;

            // Add specific messages based on the new status
            switch (appointment.status) {
                case AppointmentStatusEnum.COMPLETED:
                    message += 'Your appointment has been completed. Thank you for using our services.';
                    title = 'Appointment Completed';
                    break;
                case AppointmentStatusEnum.CANCELLED:
                    message += 'Your appointment has been cancelled. If you did not request this cancellation, please contact us.';
                    title = 'Appointment Cancelled';
                    break;
                case AppointmentStatusEnum.PENDING:
                    message += 'Your appointment is now in progress.';
                    title = 'Appointment In Progress';
                    break;
                case AppointmentStatusEnum.SAMPLE_COLLECTED:
                    message += 'Your samples have been collected. They will be processed by our laboratory.';
                    title = 'Samples Collected';
                    break;
                case AppointmentStatusEnum.CONFIRMED:
                    message += 'Your appointment has been confirmed. Please prepare for the appointment.';
                    title = 'Appointment Confirmed';
                    break;
                case AppointmentStatusEnum.SAMPLE_RECEIVED:
                    message += 'Your samples have been received by our laboratory. They will be processed soon.';
                    title = 'Samples Received';
                    break;
                case AppointmentStatusEnum.TESTING:
                    message += 'Your samples are now being tested by our laboratory.';
                    title = 'Samples Testing';
                    break;
                default:
                    message += 'If you have any questions about your appointment, please contact us.';
            }

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: `${title} - Bloodline DNA Testing Service`,
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Appointment status update email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending appointment status update email:', error);
        }
    }

    /**
     * Validate if the provided address is within the service area (TP. HCM, Việt Nam)
     */
    private validateServiceArea(address: string): boolean {
        if (!address || typeof address !== 'string') {
            return false;
        }

        // Normalize the address to lowercase for easier matching
        const normalizedAddress = address.toLowerCase().trim();

        // List of keywords that indicate the address is in Ho Chi Minh City
        const hcmKeywords = [
            'tp. hcm',
            'tp.hcm',
            'thành phố hồ chí minh',
            'ho chi minh city',
            'hcm city',
            'saigon',
            'sài gòn',
            'tp hcm',
            'tphcm',
            'hồ chí minh',
            'hcm'
        ];

        // List of Ho Chi Minh City districts
        const hcmDistricts = [
            'quận 1', 'quận 2', 'quận 3', 'quận 4', 'quận 5', 'quận 6', 'quận 7', 'quận 8', 'quận 9', 'quận 10',
            'quận 11', 'quận 12', 'quận bình thạnh', 'quận gò vấp', 'quận phú nhuận', 'quận tân bình',
            'quận tân phú', 'quận bình tân', 'quận thủ đức', 'district 1', 'district 2', 'district 3', 'district 4',
            'district 5', 'district 6', 'district 7', 'district 8', 'district 9', 'district 10', 'district 11',
            'district 12', 'binh thanh', 'go vap', 'phu nhuan', 'tan binh', 'tan phu', 'binh tan', 'thu duc'
        ];

        // Check if address contains any HCM keywords
        const hasHcmKeyword = hcmKeywords.some(keyword => normalizedAddress.includes(keyword));

        // Check if address contains any HCM district
        const hasHcmDistrict = hcmDistricts.some(district => normalizedAddress.includes(district));

        // Check if address contains Vietnam keywords
        const vietnamKeywords = ['việt nam', 'vietnam', 'vn'];
        const hasVietnamKeyword = vietnamKeywords.some(keyword => normalizedAddress.includes(keyword));

        // Address is valid if it contains HCM indicators and optionally Vietnam
        return hasHcmKeyword || hasHcmDistrict || (hasVietnamKeyword && (hasHcmKeyword || hasHcmDistrict));
    }

    /**
     * Create administrative appointment (for legal cases)
     */
    public async createAdministrativeAppointment(
        caseId: string,
        appointmentData: {
            service_id: string;
            appointment_date: Date;
            collection_address?: string;
            staff_id?: string;
            laboratory_technician_id?: string;
            participants: string[]; // IDs of participants
        },
        createdByUserId: string
    ): Promise<IAppointment> {
        try {
            // Verify administrative case exists and is approved
            const adminCase = await this.administrativeCaseService.getAdministrativeCaseById(caseId);
            if (!adminCase) {
                throw new HttpException(HttpStatus.BadRequest, 'Administrative case not found');
            }

            if (adminCase.status !== 'approved') {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'Administrative case must be approved before scheduling appointment'
                );
            }

            // Validate service
            const service = await this.serviceService.getServiceById(appointmentData.service_id);
            if (!service) {
                throw new HttpException(HttpStatus.BadRequest, 'Service not found');
            }

            // Create appointment with administrative type
            const newAppointment = {
                user_id: undefined as unknown as string, // No specific user for administrative appointments
                service_id: appointmentData.service_id,
                appointment_date: appointmentData.appointment_date,
                type: TypeEnum.ADMINISTRATIVE,
                collection_address: appointmentData.collection_address,
                status: AppointmentStatusEnum.AUTHORIZED, // Pre-authorized by agency
                payment_status: PaymentStatusEnum.GOVERNMENT_FUNDED,
                payment_stage: AppointmentPaymentStageEnum.GOVERNMENT_PAID as unknown as IAppointment['payment_stage'],
                total_amount: 0, // Government funded
                deposit_amount: 0,
                amount_paid: 0,
                administrative_case_id: caseId,
                staff_id: appointmentData.staff_id,
                laboratory_technician_id: appointmentData.laboratory_technician_id,
                agency_contact_email: adminCase.agency_contact_email,
                created_at: new Date(),
                updated_at: new Date()
            };

            const appointment = await this.appointmentRepository.create(newAppointment);

            // Update administrative case with appointment ID
            await this.administrativeCaseService.addAppointmentToCase(caseId, appointment._id);

            // Create administrative payment record (government funded)
            await this.paymentService.createAdministrativePayment(appointment._id, createdByUserId);

            // Send notification to agency
            try {
                await this.sendAdministrativeAppointmentNotification(appointment, adminCase);
            } catch (emailError) {
                console.error('Failed to send administrative appointment notification:', emailError);
            }

            return appointment;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating administrative appointment');
        }
    }

    /**
     * Send notification to agency about appointment scheduling
     */
    private async sendAdministrativeAppointmentNotification(appointment: any, adminCase: any): Promise<void> {
        try {
            const emailDetails = {
                toMail: adminCase.agency_contact_email,
                subject: `DNA Testing Appointment Scheduled - Case ${adminCase.case_number}`,
                html: `
                    <h2>DNA Testing Appointment Scheduled</h2>
                    <p>Dear ${adminCase.agency_contact_name},</p>
                    <p>The DNA testing appointment for case <strong>${adminCase.case_number}</strong> has been scheduled.</p>
                    
                    <h3>Appointment Details:</h3>
                    <ul>
                        <li><strong>Date & Time:</strong> ${new Date(appointment.appointment_date).toLocaleString()}</li>
                        <li><strong>Type:</strong> Administrative</li>
                        <li><strong>Collection Address:</strong> ${appointment.collection_address || 'At facility'}</li>
                        <li><strong>Case Type:</strong> ${adminCase.case_type}</li>
                        <li><strong>Authorization Code:</strong> ${adminCase.authorization_code || 'Pending'}</li>
                    </ul>
                    
                    <h3>Next Steps:</h3>
                    <p>1. Ensure all participants are prepared for sample collection</p>
                    <p>2. Required documents should be available during appointment</p>
                    <p>3. Results will be delivered according to specified method</p>
                    
                    <p>If you need to make any changes, please contact us immediately.</p>
                    
                    <p>Best regards,<br/>
                    Bloodline DNA Testing Service</p>
                `
            };

            await sendMail(emailDetails);
        } catch (error) {
            console.error('Error sending administrative appointment notification:', error);
        }
    }

    /**
     * Update administrative case status based on appointment progress
     */
    public async updateAdministrativeCaseProgress(appointmentId: string, newStatus: AppointmentStatusEnum): Promise<void> {
        try {
            const appointment = await this.appointmentRepository.findById(appointmentId);
            if (!appointment || !appointment.administrative_case_id) {
                return;
            }

            let caseStatus = null;
            switch (newStatus) {
                case AppointmentStatusEnum.SAMPLE_COLLECTED:
                    caseStatus = 'in_progress';
                    break;
                case AppointmentStatusEnum.TESTING:
                    caseStatus = 'in_progress';
                    break;
                case AppointmentStatusEnum.COMPLETED:
                    caseStatus = 'completed';
                    break;
            }

            if (caseStatus) {
                await this.administrativeCaseService.updateCaseStatus(
                    appointment.administrative_case_id,
                    caseStatus
                );
            }
        } catch (error) {
            console.error('Error updating administrative case progress:', error);
        }
    }
}

