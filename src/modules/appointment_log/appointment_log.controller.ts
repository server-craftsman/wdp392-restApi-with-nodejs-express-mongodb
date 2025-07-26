import { Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import AppointmentLogService from './appointment_log.service';
import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AppointmentLogActionEnum } from './appointment_log.enum';

export default class AppointmentLogController {
    private appointmentLogService = new AppointmentLogService();

    /**
     * Get appointment logs by appointment ID
     */
    public getAppointmentLogs = async (req: Request, res: Response): Promise<void> => {
        try {
            const { appointmentId } = req.params;
            const { pageNum = 1, pageSize = 10 } = req.query;

            const logs = await this.appointmentLogService.getAppointmentLogs(
                appointmentId,
                parseInt(pageNum as string),
                parseInt(pageSize as string)
            );

            res.status(HttpStatus.Success).json(
                formatResponse(logs, true, 'Appointment logs retrieved successfully')
            );
        } catch (error: any) {
            console.error('Error fetching appointment logs:', error);
            throw new HttpException(HttpStatus.InternalServerError, error.message || 'Error fetching appointment logs');
        }
    };

    /**
     * Get administrative case logs
     */
    public getAdministrativeCaseLogs = async (req: Request, res: Response): Promise<void> => {
        try {
            const { caseId } = req.params;
            const { pageNum = 1, pageSize = 10 } = req.query;

            const logs = await this.appointmentLogService.getAdministrativeCaseLogs(
                caseId,
                parseInt(pageNum as string),
                parseInt(pageSize as string)
            );

            res.status(HttpStatus.Success).json(
                formatResponse(logs, true, 'Administrative case logs retrieved successfully')
            );
        } catch (error: any) {
            console.error('Error fetching administrative case logs:', error);
            throw new HttpException(HttpStatus.InternalServerError, error.message || 'Error fetching administrative case logs');
        }
    };

    /**
     * Get logs by action type
     */
    public getLogsByAction = async (req: Request, res: Response): Promise<void> => {
        try {
            const { action } = req.params;
            const { pageNum = 1, pageSize = 10 } = req.query;

            // Validate action enum
            if (!Object.values(AppointmentLogActionEnum).includes(action as AppointmentLogActionEnum)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid action type');
            }

            const logs = await this.appointmentLogService.getLogsByAction(
                action as AppointmentLogActionEnum,
                parseInt(pageNum as string),
                parseInt(pageSize as string)
            );

            res.status(HttpStatus.Success).json(
                formatResponse(logs, true, `Logs for action '${action}' retrieved successfully`)
            );
        } catch (error: any) {
            console.error('Error fetching logs by action:', error);
            throw new HttpException(HttpStatus.InternalServerError, error.message || 'Error fetching logs by action');
        }
    };

    /**
     * Get appointment timeline (chronological activity)
     */
    public getAppointmentTimeline = async (req: Request, res: Response): Promise<void> => {
        try {
            const { appointmentId } = req.params;

            const timeline = await this.appointmentLogService.getAppointmentTimeline(appointmentId);

            res.status(HttpStatus.Success).json(
                formatResponse(timeline, true, 'Appointment timeline retrieved successfully')
            );
        } catch (error: any) {
            console.error('Error fetching appointment timeline:', error);
            throw new HttpException(HttpStatus.InternalServerError, error.message || 'Error fetching appointment timeline');
        }
    };

    /**
     * Get log statistics (for dashboard)
     */
    public getLogStatistics = async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate } = req.query;

            // This would require additional service methods to implement
            const stats = {
                totalLogs: 0,
                logsByAction: {},
                logsByStatus: {},
                adminAppointments: 0,
                message: 'Statistics feature coming soon'
            };

            res.status(HttpStatus.Success).json(
                formatResponse(stats, true, 'Log statistics retrieved successfully')
            );
        } catch (error: any) {
            console.error('Error fetching log statistics:', error);
            throw new HttpException(HttpStatus.InternalServerError, error.message || 'Error fetching log statistics');
        }
    };
} 