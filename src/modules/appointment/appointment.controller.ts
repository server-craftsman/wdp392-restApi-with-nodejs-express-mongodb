import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import { IAppointment } from './appointment.interface';
import { CreateAppointmentDto } from './dtos/createAppointment.dto';
import { AssignStaffDto } from './dtos/assign-staff.dto';
import { ConfirmAppointmentDto } from './dtos/confirm-appointment.dto';
import { SearchAppointmentDto } from './dtos/search-appointment.dto';
import AppointmentService from './appointment.service';
import { SearchPaginationResponseModel } from '../../core/models/searchPagination.model';
import { UserRoleEnum } from '../user/user.enum';
import { ISample } from '../sample/sample.interface';

export default class AppointmentController {
    private appointmentService = new AppointmentService();

    /**
     * Create a new appointment
     */
    public createAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            const appointmentData: CreateAppointmentDto = req.body;
            const appointment = await this.appointmentService.createAppointment(userId, appointmentData);

            // Return a success response with the created appointment
            res.status(HttpStatus.Created).json(formatResponse<IAppointment>(appointment));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get appointment by ID
     */
    public getAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const appointmentId = req.params.id;
            const appointment = await this.appointmentService.getAppointmentById(appointmentId);

            res.status(HttpStatus.Success).json(formatResponse<IAppointment>(appointment));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Search appointments with filters
     */
    public searchAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Convert query parameters to SearchAppointmentDto
            const searchParams: SearchAppointmentDto = {
                pageNum: req.query.pageNum ? parseInt(req.query.pageNum as string) : 1,
                pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
                user_id: req.query.user_id as string,
                service_id: req.query.service_id as string,
                status: req.query.status as any,
                type: req.query.type as any,
                staff_id: req.query.staff_id as string,
                start_date: req.query.start_date as string,
                end_date: req.query.end_date as string,
                search_term: req.query.search_term as string
            };

            const result = await this.appointmentService.searchAppointments(
                searchParams,
                userRole,
                userId
            );

            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IAppointment>>(result));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Assign staff to an appointment (by department manager)
     */
    public assignStaff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Only department managers can assign staff
            if (userRole !== UserRoleEnum.MANAGER) {
                throw new HttpException(HttpStatus.Forbidden, 'Only department managers can assign staff');
            }

            const appointmentId = req.params.id;
            const assignStaffData: AssignStaffDto = req.body;

            const updatedAppointment = await this.appointmentService.assignStaff(
                appointmentId,
                assignStaffData
            );

            res.status(HttpStatus.Success).json(formatResponse<IAppointment>(updatedAppointment));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Confirm appointment and assign kit to laboratory technician (by staff)
     */
    public confirmAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const staffId = req.user.id;
            if (!staffId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            const appointmentId = req.params.id;
            const confirmData: ConfirmAppointmentDto = req.body;
            const userRole = req.user.role;

            const updatedAppointment = await this.appointmentService.confirmAppointment(
                appointmentId,
                confirmData,
                staffId,
                userRole
            );

            res.status(HttpStatus.Success).json(formatResponse<IAppointment>(updatedAppointment));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get samples for an appointment
     */
    public getAppointmentSamples = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const appointmentId = req.params.id;
            const samples = await this.appointmentService.getAppointmentSamples(appointmentId);

            res.status(HttpStatus.Success).json(formatResponse<ISample[]>(samples));
        } catch (error) {
            next(error);
        }
    };
}
