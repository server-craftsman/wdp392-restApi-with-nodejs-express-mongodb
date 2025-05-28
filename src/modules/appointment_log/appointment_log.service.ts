import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IAppointmentLog } from './appointment_log.interface';
import { AppointmentLogTypeEnum } from './appointment_log.enum';
import AppointmentLogRepository from './appointment_log.repository';
import { IAppointment } from '../appointment/appointment.interface';
import { SearchPaginationResponseModel } from '../../core/models';
import mongoose from 'mongoose';

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
} 