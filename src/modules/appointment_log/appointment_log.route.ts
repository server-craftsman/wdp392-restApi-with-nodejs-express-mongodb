import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import AppointmentLogController from './appointment_log.controller';

export default class AppointmentLogRoute implements IRoute {
    public path = API_PATH.APPOINTMENT_LOG;
    public router = Router();
    private appointmentLogController = new AppointmentLogController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET: domain:/api/appointment-log/appointment/:appointmentId -> Get logs for specific appointment
        this.router.get(
            `${this.path}/appointment/:appointmentId`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.appointmentLogController.getAppointmentLogs
        );

        // GET: domain:/api/appointment-log/appointment/:appointmentId/timeline -> Get timeline for appointment
        this.router.get(
            `${this.path}/appointment/:appointmentId/timeline`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.appointmentLogController.getAppointmentTimeline
        );

        // GET: domain:/api/appointment-log/administrative-case/:caseId -> Get logs for administrative case
        this.router.get(
            `${this.path}/administrative-case/:caseId`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.appointmentLogController.getAdministrativeCaseLogs
        );

        // GET: domain:/api/appointment-log/action/:action -> Get logs by action type
        this.router.get(
            `${this.path}/action/:action`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.appointmentLogController.getLogsByAction
        );

        // GET: domain:/api/appointment-log/statistics -> Get log statistics for dashboard
        this.router.get(
            `${this.path}/statistics`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.appointmentLogController.getLogStatistics
        );
    }
} 