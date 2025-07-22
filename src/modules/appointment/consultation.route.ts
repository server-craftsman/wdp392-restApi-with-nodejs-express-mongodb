import { Router } from 'express';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import AppointmentController from './appointment.controller';
import { CreateConsultationDto } from './dtos/createConsultation.dto';
import { VerifyOTPDto } from './dtos/verifyOTP.dto';

export default class ConsultationRoute implements IRoute {
    public path = '/api/consultation';
    public router = Router();
    private appointmentController = new AppointmentController();

    constructor() {
        console.log('[CONSULTATION ROUTE] Constructor called, registering routes...');
        this.initializeRoutes();
    }

    private initializeRoutes() {
        console.log('[CONSULTATION ROUTE] Initializing routes with path:', this.path);

        // POST: domain:/api/consultation -> Create consultation request (public)
        this.router.post(
            `${this.path}`,
            (req, res, next) => {
                console.log('[CONSULTATION ROUTE] POST /api/consultation matched');
                next();
            },
            validationMiddleware(CreateConsultationDto),
            this.appointmentController.createConsultation
        );

        // GET: domain:/api/consultation -> Get consultation requests
        this.router.get(
            `${this.path}`,
            (req, res, next) => {
                console.log('[CONSULTATION ROUTE] GET /api/consultation matched');
                next();
            },
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.appointmentController.getConsultationRequests
        );

        // GET: domain:/api/consultation/:id -> Get consultation by ID
        this.router.get(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.appointmentController.getConsultationById
        );

        // PATCH: domain:/api/consultation/:id/assign -> Assign consultant
        this.router.patch(
            `${this.path}/:id/assign`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.appointmentController.assignConsultant
        );

        // PATCH: domain:/api/consultation/:id/status -> Update consultation status
        this.router.patch(
            `${this.path}/:id/status`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.appointmentController.updateConsultationStatus
        );
    }
} 