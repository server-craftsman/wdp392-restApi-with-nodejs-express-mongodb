import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import ReservationController from './reservation.controller';
import { CreateReservationDto } from './dtos/createReservation.dto';
import { ReservationPaymentDto } from './dtos/reservationPayment.dto';

export default class ReservationRouter implements IRoute {
    public path = API_PATH.RESERVATIONS;
    public router = Router();
    private reservationController = new ReservationController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST: domain:/api/reservations -> Create new reservation for administrative service
        this.router.post(
            `${this.path}`,
            authMiddleWare([UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            validationMiddleware(CreateReservationDto),
            this.reservationController.createReservation
        );

        // GET: domain:/api/reservations -> Get user's reservations
        this.router.get(
            `${this.path}`,
            authMiddleWare([UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.reservationController.getUserReservations
        );

        // GET: domain:/api/reservations/service/:serviceId -> Get reservations by service ID (Admin/Manager/Staff only)
        this.router.get(
            `${this.path}/service/:serviceId`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.reservationController.getReservationsByServiceId
        );

        // GET: domain:/api/reservations/testing-need/:testingNeed -> Get reservations by testing need (Admin/Manager/Staff only)
        this.router.get(
            `${this.path}/testing-need/:testingNeed`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.reservationController.getReservationsByTestingNeed
        );

        // GET: domain:/api/reservations/:id -> Get reservation by ID
        this.router.get(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.reservationController.getReservationById
        );

        // PUT: domain:/api/reservations/:id -> Update reservation
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.reservationController.updateReservation
        );

        // DELETE: domain:/api/reservations/:id -> Cancel reservation
        this.router.delete(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.reservationController.cancelReservation
        );

        // POST: domain:/api/reservations/:id/payment -> Process payment for reservation
        this.router.post(
            `${this.path}/:id/payment`,
            authMiddleWare([UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            validationMiddleware(ReservationPaymentDto),
            this.reservationController.processReservationPayment
        );

        // POST: domain:/api/reservations/:id/convert -> Convert reservation to appointment
        this.router.post(
            `${this.path}/:id/convert`,
            authMiddleWare([UserRoleEnum.CUSTOMER, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.reservationController.convertReservationToAppointment
        );

        // PUT: domain:/api/reservations/:id/confirm -> Confirm reservation (Admin/Manager/Staff only)
        this.router.put(
            `${this.path}/:id/confirm`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.reservationController.confirmReservation
        );
    }
} 