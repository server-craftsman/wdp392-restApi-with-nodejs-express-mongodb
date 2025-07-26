import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import ReservationService from './reservation.service';
import { UserRoleEnum } from '../user/user.enum';
import { CreateReservationDto } from './dtos/createReservation.dto';
import { ReservationPaymentDto } from './dtos/reservationPayment.dto';
import { TestingNeedEnum } from './appointment.enum';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export default class ReservationController {
    private reservationService = new ReservationService();

    /**
     * Create a new reservation for administrative service
     */
    public createReservation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;

            // Transform and validate request body
            const dto = plainToClass(CreateReservationDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                const errorMessages = errors.map((error) => Object.values(error.constraints || {}).join(', ')).join('; ');
                throw new HttpException(HttpStatus.BadRequest, `Validation failed: ${errorMessages}`);
            }

            const result = await this.reservationService.createReservation(userId, dto);

            // Check if any fields were auto-populated
            const autoPopulatedFields = [];
            if (!req.body.total_amount) autoPopulatedFields.push('total_amount');
            if (!req.body.deposit_amount) autoPopulatedFields.push('deposit_amount');
            if (!req.body.collection_type) autoPopulatedFields.push('collection_type');

            let message = 'Reservation created successfully';
            if (autoPopulatedFields.length > 0) {
                message += `. Auto-populated fields: ${autoPopulatedFields.join(', ')}`;
            }

            res.status(HttpStatus.Created).json(formatResponse(result, true, message));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get reservation by ID
     */
    public getReservationById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reservationId = req.params.id;
            const userId = req.user.id;

            if (!reservationId) {
                throw new HttpException(HttpStatus.BadRequest, 'Reservation ID is required');
            }

            const result = await this.reservationService.getReservationById(reservationId);

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Reservation not found');
            }

            // Check if user can access this reservation
            if (result.user_id !== userId && ![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Access denied');
            }

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Reservation retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get user's reservations
     */
    public getUserReservations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;

            const result = await this.reservationService.getReservationsByUserId(userId);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'User reservations retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get reservations by service ID (Admin/Manager/Staff only)
     */
    public getReservationsByServiceId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Access denied. Admin, Manager, or Staff access required.');
            }

            const serviceId = req.params.serviceId;

            if (!serviceId) {
                throw new HttpException(HttpStatus.BadRequest, 'Service ID is required');
            }

            const result = await this.reservationService.getReservationsByServiceId(serviceId);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Service reservations retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get reservations by testing need (Admin/Manager/Staff only)
     */
    public getReservationsByTestingNeed = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Access denied. Admin, Manager, or Staff access required.');
            }

            const testingNeed = req.params.testingNeed as TestingNeedEnum;

            if (!testingNeed || !Object.values(TestingNeedEnum).includes(testingNeed)) {
                throw new HttpException(HttpStatus.BadRequest, 'Valid testing need is required');
            }

            const result = await this.reservationService.getReservationsByTestingNeed(testingNeed);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Testing need reservations retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update reservation
     */
    public updateReservation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reservationId = req.params.id;
            const userId = req.user.id;

            if (!reservationId) {
                throw new HttpException(HttpStatus.BadRequest, 'Reservation ID is required');
            }

            const result = await this.reservationService.updateReservation(reservationId, userId, req.body);

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Reservation not found');
            }

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Reservation updated successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Cancel reservation
     */
    public cancelReservation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reservationId = req.params.id;
            const userId = req.user.id;

            if (!reservationId) {
                throw new HttpException(HttpStatus.BadRequest, 'Reservation ID is required');
            }

            const result = await this.reservationService.cancelReservation(reservationId, userId);

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Reservation not found');
            }

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Reservation cancelled successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Process payment for reservation
     */
    public processReservationPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;

            // Transform and validate request body
            const dto = plainToClass(ReservationPaymentDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                const errorMessages = errors.map((error) => Object.values(error.constraints || {}).join(', ')).join('; ');
                throw new HttpException(HttpStatus.BadRequest, `Validation failed: ${errorMessages}`);
            }

            const result = await this.reservationService.processReservationPayment(userId, dto);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Payment processed successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Convert reservation to appointment
     */
    public convertReservationToAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reservationId = req.params.id;
            const userId = req.user.id;

            if (!reservationId) {
                throw new HttpException(HttpStatus.BadRequest, 'Reservation ID is required');
            }

            const result = await this.reservationService.convertReservationToAppointment(reservationId, userId);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Reservation converted to appointment successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Confirm reservation (Admin/Manager/Staff only)
     */
    public confirmReservation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Access denied. Admin, Manager, or Staff access required.');
            }

            const reservationId = req.params.id;

            if (!reservationId) {
                throw new HttpException(HttpStatus.BadRequest, 'Reservation ID is required');
            }

            const result = await this.reservationService.confirmReservation(reservationId);

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Reservation not found');
            }

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Reservation confirmed successfully'));
        } catch (error) {
            next(error);
        }
    };
} 