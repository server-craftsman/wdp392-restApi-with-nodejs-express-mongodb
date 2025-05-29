import mongoose, { Schema } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';
import { IAppointment } from './appointment.interface';
import { AppointmentStatusEnum, TypeEnum } from './appointment.enum';
import { CreateAppointmentDto } from './dtos/createAppointment.dto';
import { AssignStaffDto } from './dtos/assign-staff.dto';
import { ConfirmAppointmentDto } from './dtos/confirm-appointment.dto';
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

export default class AppointmentService {
    private appointmentRepository = new AppointmentRepository();
    private appointmentLogService = new AppointmentLogService();
    private kitService = new KitService();
    private staffProfileSchema = new StaffProfileSchema();

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

                // Kiểm tra xem loại dịch vụ có khớp với loại dịch vụ của slot không
                if (slot.service_id && slot.service_id.toString() !== appointmentData.service_id) {
                    throw new HttpException(HttpStatus.BadRequest, 'Slot is not available for this service');
                }

                // Nếu không có ngày appointment, sử dụng ngày từ slot entity
                if (!appointmentData.appointment_date) {
                    appointmentData.appointment_date = new Date(
                        slot?.time_slots?.[0]?.year ?? new Date().getFullYear(),
                        (slot?.time_slots?.[0]?.month ?? new Date().getMonth() + 1) - 1,
                        slot?.time_slots?.[0]?.day ?? new Date().getDate()
                    );

                    // Set the appointment time to the slot's start time
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
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID');
        }

        const appointment = await this.appointmentRepository.findByIdWithPopulate(id);
        if (!appointment) {
            throw new HttpException(HttpStatus.NotFound, 'Appointment not found');
        }

        return appointment;
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
}
