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
        try {
            const service = await ServiceSchema.findById(appointmentData.service_id);
            if (!service) {
                throw new HttpException(HttpStatus.NotFound, 'Service not found');
            }

            let slot;
            // Nếu có slot_id, kiểm tra slot
            if (appointmentData.slot_id) {
                slot = await SlotSchema.findById(appointmentData.slot_id);
                if (!slot) {
                    throw new HttpException(HttpStatus.NotFound, 'Slot not found');
                }

                // Kiểm tra xem slot có khả dụng không
                if (slot.status !== SlotStatusEnum.AVAILABLE) {
                    throw new HttpException(HttpStatus.BadRequest, 'Slot is not available');
                }

                // // Kiểm tra xem loại dịch vụ có khớp với loại dịch vụ của slot không
                // if (slot.service_id && slot.service_id.toString() !== appointmentData.service_id) {
                //     throw new HttpException(HttpStatus.BadRequest, 'Slot is not available for this service');
                // }

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
                throw new HttpException(HttpStatus.BadRequest, 'Either slot_id or appointment_date must be provided');
            }

            // kiểm tra xem loại dịch vụ có phù hợp với loại dịch vụ không
            if (service.sample_method === SampleMethodEnum.FACILITY_COLLECTED &&
                appointmentData.type !== TypeEnum.FACILITY) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'This service requires facility collection'
                );
            }

            if (service.sample_method === SampleMethodEnum.HOME_COLLECTED &&
                appointmentData.type !== TypeEnum.HOME) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'This service requires home collection'
                );
            }

            if (service.sample_method === SampleMethodEnum.SELF_COLLECTED &&
                appointmentData.type !== TypeEnum.SELF) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'This service requires self collection'
                );
            }

            // Đối với dịch vụ thu thập tại nhà, địa chỉ thu thập là bắt buộc
            if (appointmentData.type === TypeEnum.HOME && !appointmentData.collection_address) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'Collection address is required for home collection'
                );
            }

            // Tạo appointment
            const appointment = await this.appointmentRepository.create({
                user_id: userId as any,
                service_id: appointmentData.service_id as any,
                slot_id: appointmentData.slot_id as any,
                appointment_date: appointmentData.appointment_date,
                type: appointmentData.type,
                collection_address: appointmentData.collection_address,
                status: AppointmentStatusEnum.PENDING,
                payment_status: PaymentStatusEnum.UNPAID,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Chỉ cập nhật status slot sau khi appointment được tạo thành công
            if (appointmentData.slot_id && slot) {
                await SlotSchema.findByIdAndUpdate(
                    appointmentData.slot_id,
                    { status: SlotStatusEnum.BOOKED },
                    { new: true }
                );
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
                // console.log(`Appointment log created for appointment ID: ${appointment._id}`);
            } catch (logError) {
                console.error('Failed to create appointment log:', logError);
            }

            return appointment;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
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

        // Kiểm tra nhân viên có tồn tại và hoạt động
        if (!mongoose.Types.ObjectId.isValid(assignStaffData.staff_id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid staff ID');
        }

        // Lấy thông tin user trước
        const staffUser = await UserSchema.findById(assignStaffData.staff_id);
        if (!staffUser) {
            throw new HttpException(HttpStatus.NotFound, 'Staff user not found');
        }

        // Kiểm tra staff profile liên kết với user
        const staffProfile = await StaffProfileSchema.findOne({ user_id: staffUser._id });
        if (!staffProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found');
        }

        if (staffProfile.status !== StaffStatusEnum.ACTIVE) {
            throw new HttpException(HttpStatus.BadRequest, 'Staff is not active');
        }

        // Kiểm tra xem user có liên kết với staff profile này không
        if (staffProfile.user_id.toString() !== staffUser._id.toString()) {
            throw new HttpException(HttpStatus.BadRequest, 'Staff profile is not linked to the correct user');
        }

        // Cập nhật appointment với ID của user (không phải staff profile)
        const oldStatus = appointment.status;
        const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(
            appointmentId,
            {
                staff_id: staffUser._id as any,
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
     * Xác nhận appointment và gán kit (bởi nhân viên) - API cho quy trình tự thu mẫu - self collection
     */
    public async confirmAppointment(
        appointmentId: string,
        confirmData: ConfirmAppointmentDto,
        staffId: string,
        userRole: UserRoleEnum
    ): Promise<IAppointment> {
        const appointment = await this.getAppointmentById(appointmentId);
        // Only staff can confirm appointments
        if (userRole !== UserRoleEnum.STAFF) {
            throw new HttpException(HttpStatus.Forbidden, 'Only staff can confirm appointments');
        }

        // Kiểm tra appointment có nhân viên được gán và nó khớp với nhân viên hiện tại
        if (!appointment.staff_id) {
            throw new HttpException(
                HttpStatus.BadRequest,
                'No staff assigned to this appointment yet. Department manager must assign staff first.'
            );
        }

        // Kiểm tra xem appointment có phải là dịch vụ tự thu thập không
        if (appointment.type !== TypeEnum.SELF) {
            throw new HttpException(
                HttpStatus.BadRequest,
                'This endpoint is only for self-collection appointments'
            );
        }

        // Kiểm tra xem appointment có trạng thái là PENDING không
        if (appointment.status !== AppointmentStatusEnum.PENDING) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `Cannot confirm appointment with status ${appointment.status}`
            );
        }

        // Kiểm tra xem nhân viên được gán đến appointment là nhân viên xác nhận
        const staffProfile = await StaffProfileSchema.findOne({ user_id: staffId });
        if (!staffProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found');
        }

        // Lấy thông tin user được gán cho appointment
        const appointmentStaff = await UserSchema.findById(appointment.staff_id);
        if (!appointmentStaff) {
            throw new HttpException(HttpStatus.NotFound, 'Assigned staff not found');
        }

        // Kiểm tra xem staffId (từ token) có khớp với staff_id trong appointment không
        if (appointmentStaff._id.toString() !== staffId) {
            throw new HttpException(
                HttpStatus.Forbidden,
                'You are not assigned to this appointment'
            );
        }

        // Kiểm tra laboratory technician ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(confirmData.laboratory_technician_id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid laboratory technician ID');
        }

        // Kiểm tra laboratory technician có tồn tại không
        const labTechnician = await UserSchema.findById(confirmData.laboratory_technician_id);
        if (!labTechnician) {
            throw new HttpException(HttpStatus.NotFound, 'Laboratory technician not found');
        }

        // Kiểm tra xem user có phải là laboratory technician không
        if (labTechnician.role !== UserRoleEnum.LABORATORY_TECHNICIAN) {
            throw new HttpException(
                HttpStatus.BadRequest,
                'The selected user is not a laboratory technician'
            );
        }

        // get user_id từ appointment
        let userId: string;

        // xử lí user_id từ appointment convert  from object to string
        if (appointment.user_id) { // kiểm tra xem user_id có tồn tại trong bảng appointment không
            if (typeof appointment.user_id === 'object') { // kiểm tra xem user_id có phải là object không
                // convert user_id từ object sang string
                const userObj = appointment.user_id as any; // convert user_id từ object sang any
                if (userObj._id) { // kiểm tra xem user_id có phải là _id không
                    userId = userObj._id.toString(); // convert _id từ object sang string
                } else if (userObj.id) { // kiểm tra xem user_id có phải là id không
                    userId = userObj.id.toString();
                } else {
                    throw new HttpException(HttpStatus.BadRequest, 'Invalid user object in appointment');
                }
            } else {
                // convert user_id từ string sang string
                userId = (appointment.user_id as any).toString();
            }
        } else {
            throw new HttpException(HttpStatus.BadRequest, 'User ID not found in appointment');
        }

        // Gán kit cho appointment và laboratory technician thay vì khách hàng
        await this.kitService.assignKit(
            confirmData.kit_id,
            appointmentId,
            confirmData.laboratory_technician_id // Sử dụng laboratory technician ID thay vì user ID
        );

        // Cập nhật trạng thái appointment thành CONFIRMED
        const oldStatus = appointment.status;
        const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(
            appointmentId,
            {
                status: AppointmentStatusEnum.CONFIRMED,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedAppointment) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to confirm appointment');
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

        return updatedAppointment;
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
            const appointments = await this.appointmentRepository.findWithPopulate(
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
}
