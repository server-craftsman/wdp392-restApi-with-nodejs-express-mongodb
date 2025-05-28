import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import { IAppointmentLog } from './appointment_log.interface';
import AppointmentLogService from './appointment_log.service';
import { SearchPaginationResponseModel } from '../../core/models/searchPagination.model';

export default class AppointmentLogController {
    private appointmentLogService = new AppointmentLogService();

    /**
     * Get logs for a specific appointment
     */
    public getLogsByAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const appointmentId = req.params.appointmentId;
            if (!appointmentId) {
                throw new HttpException(HttpStatus.BadRequest, 'Appointment ID is required');
            }

            const logs = await this.appointmentLogService.getLogsByAppointmentId(appointmentId, req.query);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IAppointmentLog>>(logs));
        } catch (error) {
            next(error);
        }
    };
} 