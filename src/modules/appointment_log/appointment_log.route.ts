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
        // GET: domain:/api/appointment-logs/appointment/:appointmentId -> Get logs for a specific appointment
        this.router.get(
            `${API_PATH.GET_LOGS_BY_APPOINTMENT}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.CUSTOMER]),
            this.appointmentLogController.getLogsByAppointmentId
        );
    }
} 