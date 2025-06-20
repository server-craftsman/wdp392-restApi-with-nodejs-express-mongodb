import mongoose, { Schema } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';
import { IAppointment } from './appointment.interface';
import { AppointmentStatusEnum, TypeEnum, PaymentStatusEnum } from './appointment.enum';
import { CreateAppointmentDto } from './dtos/createAppointment.dto';
import { AssignStaffDto } from './dtos/assign-staff.dto';
import { ConfirmAppointmentDto } from './dtos/confirm-appointment.dto';
import { SearchAppointmentDto } from './dtos/search-appointment.dto';
import AppointmentRepository from './appointment.repository';
import SlotSchema from '../slot/slot.model';
import { SlotStatusEnum } from '../slot/slot.enum';
import ServiceSchema from '../service/service.model';
import { SampleMethodEnum } from '../service/service.enum';
import { AppointmentLogService } from '../appointment_log';
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
import { AdministrativeCaseSchema } from '../administrative_cases/administrative_cases.model';
import { AdministrativeCaseStatus } from '../administrative_cases/administrative_cases.enum';
import { ServiceTypeEnum } from '../service/service.enum';
import PaymentService from '../payment/payment.service';

export default class AppointmentService {
    private readonly appointmentRepository: AppointmentRepository;
    private readonly appointmentLogService: AppointmentLogService;
    private readonly kitService: KitService;
    private readonly staffProfileSchema: typeof StaffProfileSchema;
    private sampleService?: SampleService;

    constructor() {
        this.appointmentRepository = new AppointmentRepository();
        this.appointmentLogService = new AppointmentLogService();
        this.kitService = new KitService();
        this.staffProfileSchema = StaffProfileSchema;
    }

    private getSampleService(): SampleService {
        if (!this.sampleService) {
            this.sampleService = new SampleService();
        }
        return this.sampleService;
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

            // Kiểm tra xem có agency_contact_email không
            if (service.type === ServiceTypeEnum.ADMINISTRATIVE && !appointmentData.agency_contact_email) {
                throw new HttpException(HttpStatus.BadRequest, 'agency_contact_email is required for ADMINISTRATIVE service');
            }

            // set agency_contact_email to appointment entity bằng cách copy từ administrative_case
            if (service.type === ServiceTypeEnum.ADMINISTRATIVE && appointmentData.agency_contact_email) {

                const adminCase = await AdministrativeCaseSchema.findOne({
                    case_number: appointmentData.case_number,
                    authorization_code: appointmentData.authorization_code
                });
                if (!adminCase) {
                    throw new HttpException(HttpStatus.NotFound, 'Administrative case not found or invalid');
                }
                administrative_case_id = (adminCase._id as any).toString();
                appointmentData.agency_contact_email = adminCase.agency_contact_email;
            }

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
                await this.appointmentLogService.logAppointmentCreation(appointment);
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
            await this.appointmentLogService.logStatusChange(
                updatedAppointment,
                oldStatus as unknown as AppointmentLogTypeEnum
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
                await this.appointmentLogService.logStatusChange(
                    updatedAppointment,
                    oldStatus as unknown as AppointmentLogTypeEnum
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

            // Search term for address (if it's a home collection)
            if (searchParams.search_term) {
                const searchRegex = new RegExp(searchParams.search_term, 'i');

                // If there's a search term, we'll search in collection_address if type is HOME
                if (searchParams.type === TypeEnum.HOME) {
                    query.collection_address = { $regex: searchRegex };
                } else {
                    // For other cases, we'll need to join with the user collection to search in name
                    // This is handled by the populate in findWithPopulate
                }
            }

            // Count total documents matching the query
            const totalCount = await this.appointmentRepository.countDocuments(query);

            // Sort by appointment date (newest first)
            const sort = { appointment_date: -1 };

            // Fetch appointments with pagination
            const appointments = await this.appointmentRepository.findWithPaginationAndPopulate(
                query,
                sort,
                skip,
                pageSize
            );

            // If there's a search term and we're not specifically searching in collection_address,
            // filter the results that match the search term in user name
            let filteredAppointments = appointments;
            if (searchParams.search_term && searchParams.type !== TypeEnum.HOME) {
                const searchRegex = new RegExp(searchParams.search_term, 'i');
                filteredAppointments = appointments.filter(appointment => {
                    const user = appointment.user_id as any;
                    if (user && (user.first_name || user.last_name)) {
                        const fullName = `${user.first_name || ''} ${user.last_name || ''}`;
                        return searchRegex.test(fullName);
                    }
                    return false;
                });
            }

            return {
                pageData: filteredAppointments,
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
                oldStatus as unknown as AppointmentLogTypeEnum
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
    public async getUserRoleStaff(): Promise<any[]> {
        try {
            // Get all staff users
            const staffUsers = await UserSchema.find({ role: UserRoleEnum.STAFF })
                .select('_id first_name last_name email phone_number');

            // Get staff profiles
            const staffProfiles = await StaffProfileSchema.find({
                user_id: { $in: staffUsers.map(user => user._id) }
            }).select('user_id status department');

            // Combine user and profile information, only include staff with profiles
            const staffWithRoles = staffUsers
                .map(user => {
                    const profile = staffProfiles.find(p => p.user_id?.toString() === user._id.toString());
                    if (!profile) return null;

                    return {
                        ...user.toObject(),
                        staff_profile: {
                            status: profile.status,
                            department: profile.department_id
                        }
                    };
                })
                .filter(staff => staff !== null);

            return staffWithRoles;
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
        queryParams: any = {}
    ): Promise<SearchPaginationResponseModel<IAppointment>> {
        try {
            const query = {
                staff_id: new mongoose.Types.ObjectId(staffId),
                ...this.processQueryParams(queryParams)
            };
            return this.searchAppointments(query, UserRoleEnum.STAFF, staffId);
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
        queryParams: any = {}
    ): Promise<SearchPaginationResponseModel<IAppointment>> {
        try {
            const query = {
                laboratory_technician_id: {
                    $exists: true,
                    $ne: null,
                    $eq: new mongoose.Types.ObjectId(labTechId)
                },
                ...this.processQueryParams(queryParams)
            };
            return this.searchAppointments(query, UserRoleEnum.LABORATORY_TECHNICIAN, labTechId);
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
                await this.appointmentLogService.logAppointmentCreation(updatedAppointment);
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
}
