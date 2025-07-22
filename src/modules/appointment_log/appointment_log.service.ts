import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IAppointmentLog } from './appointment_log.interface';
import { AppointmentLogTypeEnum } from './appointment_log.enum';
import AppointmentLogRepository from './appointment_log.repository';
import { IAppointment } from '../appointment/appointment.interface';
import { SearchPaginationResponseModel } from '../../core/models';
import mongoose from 'mongoose';
import { ISample } from '../sample/sample.interface';

export default class AppointmentLogService {
    private appointmentLogRepository = new AppointmentLogRepository();

    /**
     * Tạo log cho sự kiện tạo appointment
     * @param appointmentData Thông tin appointment
     * @param oldStatus Trạng thái cũ (null cho sự kiện tạo mới)
     * @param newStatus Trạng thái mới
     */
    public async createAppointmentLog(
        appointmentData: IAppointment,
        oldStatus: AppointmentLogTypeEnum | undefined,
        newStatus: AppointmentLogTypeEnum
    ): Promise<IAppointmentLog> {
        try {
            const appointmentLog = await this.appointmentLogRepository.create({
                appointment_id: appointmentData._id as any,
                customer_id: appointmentData.user_id,
                staff_id: appointmentData.staff_id,
                old_status: oldStatus,
                new_status: newStatus,
                type: appointmentData.type,
                created_at: new Date(),
                updated_at: new Date()
            });

            return appointmentLog;
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating appointment log');
        }
    }

    /**
     * Log sự kiện tạo appointment
     * @param appointmentData Thông tin appointment mới được tạo
     */
    public async logAppointmentCreation(appointmentData: IAppointment): Promise<IAppointmentLog> {
        return this.createAppointmentLog(
            appointmentData,
            undefined, // Không có trạng thái cũ cho sự kiện tạo mới
            appointmentData.status as unknown as AppointmentLogTypeEnum
        );
    }

    /**
     * Log sự kiện thay đổi trạng thái appointment
     * @param appointmentData Thông tin appointment đã được cập nhật
     * @param oldStatus Trạng thái cũ
     */
    public async logStatusChange(
        appointmentData: IAppointment,
        oldStatus: AppointmentLogTypeEnum
    ): Promise<IAppointmentLog> {
        return this.createAppointmentLog(
            appointmentData,
            oldStatus,
            appointmentData.status as unknown as AppointmentLogTypeEnum
        );
    }

    /**
     * Lấy logs cho một appointment cụ thể
     * @param appointmentId ID của appointment
     * @param queryParams Tham số truy vấn cho phân trang
     */
    public async getLogsByAppointmentId(
        appointmentId: string,
        queryParams: any = {}
    ): Promise<SearchPaginationResponseModel<IAppointmentLog>> {
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID');
        }

        // Xử lý tham số truy vấn
        const { pageNum = 1, pageSize = 10 } = this.processQueryParams(queryParams);
        const skip = (pageNum - 1) * pageSize; // Bỏ qua bao nhiêu logs

        // Xây dựng truy vấn
        const query = { appointment_id: appointmentId };

        // Đếm tổng số logs
        const totalItems = await this.appointmentLogRepository.countDocuments(query);
        const totalPages = Math.ceil(totalItems / pageSize);

        // Lấy logs với phân trang và sắp xếp theo ngày tạo (mới nhất trước)
        const logs = await this.appointmentLogRepository.findWithPopulate(
            query,
            { created_at: -1 }, // Sắp xếp theo ngày tạo (mới nhất trước)
            skip,
            pageSize
        );

        return {
            pageData: logs,
            pageInfo: {
                pageNum,
                pageSize,
                totalItems,
                totalPages
            }
        };
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
     * Log sample creation for an appointment
     * @param appointmentData The appointment data
     * @param samples The created samples
     */
    public async logSampleCreation(
        appointmentData: IAppointment,
        samples: ISample[]
    ): Promise<IAppointmentLog> {
        try {
            const sampleTypes = samples.map(sample => sample.type).join(', ');
            const notes = `Created ${samples.length} sample(s): ${sampleTypes}`;

            const appointmentLog = await this.appointmentLogRepository.create({
                appointment_id: appointmentData._id as any,
                customer_id: appointmentData.user_id,
                staff_id: appointmentData.staff_id,
                old_status: appointmentData.status as unknown as AppointmentLogTypeEnum,
                new_status: AppointmentLogTypeEnum.SAMPLE_CREATED,
                type: appointmentData.type,
                notes: notes,
                created_at: new Date(),
                updated_at: new Date()
            });

            return appointmentLog;
        } catch (error) {
            console.error('Error creating sample creation log:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating sample creation log');
        }
    }

    /**
     * Log consultation creation
     */
    public async logConsultationCreation(consultation: any): Promise<void> {
        try {
            const logData = {
                customer_id: undefined,
                staff_id: undefined,
                laboratory_technician_id: undefined,
                appointment_id: undefined,
                old_status: AppointmentLogTypeEnum.PENDING,
                new_status: AppointmentLogTypeEnum.PENDING,
                type: consultation.type, // Use consultation type (HOME/FACILITY)
                notes: `Consultation request created for ${consultation.first_name} ${consultation.last_name} - Subject: ${consultation.subject}`,
                created_at: new Date(),
                updated_at: new Date()
            };

            await this.appointmentLogRepository.create(logData);
        } catch (error) {
            console.error('Error logging consultation creation:', error);
        }
    }

    /**
     * Log consultation assignment
     */
    public async logConsultationAssignment(consultation: any, consultantId: string): Promise<void> {
        try {
            const logData = {
                customer_id: undefined,
                staff_id: consultantId,
                laboratory_technician_id: undefined,
                appointment_id: undefined,
                old_status: AppointmentLogTypeEnum.PENDING,
                new_status: AppointmentLogTypeEnum.CONFIRMED,
                type: consultation.type,
                notes: `Consultant assigned to consultation for ${consultation.first_name} ${consultation.last_name} - Subject: ${consultation.subject}`,
                created_at: new Date(),
                updated_at: new Date()
            };

            await this.appointmentLogRepository.create(logData);
        } catch (error) {
            console.error('Error logging consultation assignment:', error);
        }
    }

    /**
     * Log consultation status change
     */
    public async logConsultationStatusChange(consultation: any, newStatus: string): Promise<void> {
        try {
            let logNewStatus = AppointmentLogTypeEnum.PENDING;
            let logOldStatus = AppointmentLogTypeEnum.PENDING;

            // Map consultation status to appropriate log type
            switch (newStatus) {
                case 'SCHEDULED':
                    logNewStatus = AppointmentLogTypeEnum.CONFIRMED;
                    break;
                case 'COMPLETED':
                    logNewStatus = AppointmentLogTypeEnum.COMPLETED;
                    break;
                case 'CANCELLED':
                    logNewStatus = AppointmentLogTypeEnum.CANCELLED;
                    break;
                default:
                    logNewStatus = AppointmentLogTypeEnum.PENDING;
            }

            const logData = {
                customer_id: undefined,
                staff_id: consultation.assigned_consultant_id,
                laboratory_technician_id: undefined,
                appointment_id: undefined,
                old_status: logOldStatus,
                new_status: logNewStatus,
                type: consultation.type,
                notes: `Consultation status changed to ${newStatus} for ${consultation.first_name} ${consultation.last_name} - Subject: ${consultation.subject}`,
                created_at: new Date(),
                updated_at: new Date()
            };

            await this.appointmentLogRepository.create(logData);
        } catch (error) {
            console.error('Error logging consultation status change:', error);
        }
    }
} 