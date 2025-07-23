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
import { CreateConsultationDto } from './dtos/createConsultation.dto';
import { IConsultation, ConsultationStatusEnum } from './consultation.interface';

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
     * Assign staff to appointment
     * @route PUT /api/appointment/:id/assign-staff
     */
    public assignStaff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Kiểm tra quyền truy cập
            if (req.user.role !== UserRoleEnum.MANAGER && req.user.role !== UserRoleEnum.ADMIN) {
                throw new HttpException(HttpStatus.Forbidden, 'Only managers and admins can assign staff to appointments');
            }

            const appointmentId = req.params.id;
            const assignStaffData: AssignStaffDto = req.body;

            try {
                const appointment = await this.appointmentService.assignStaff(appointmentId, assignStaffData);
                res.status(HttpStatus.Success).json(formatResponse<IAppointment>(appointment));
            } catch (error) {
                // Kiểm tra nếu lỗi liên quan đến giới hạn số lượng cuộc hẹn
                if (error instanceof HttpException &&
                    error.status === HttpStatus.BadRequest &&
                    error.message.includes('appointment limit')) {

                    // Trả về lỗi với gợi ý về nhân viên thay thế
                    res.status(error.status).json({
                        success: false,
                        message: error.message,
                        suggestion: 'Consider using another staff member who has not reached their appointment limit'
                    });
                } else {
                    // Trả về lỗi thông thường
                    next(error);
                }
            }
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

            res.status(HttpStatus.Success).json(formatResponse<IAppointment>(updatedAppointment as IAppointment));
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

    public getAppointmentPrice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { appointmentId } = req.params;
            const price = await this.appointmentService.getAppointmentPrice(appointmentId);

            res.status(HttpStatus.Success).json(
                formatResponse({ price }, true, 'Appointment price  retrieved successfully')
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get staff roles (Department Manager only)
     */
    public getStaffRoles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Lấy filter address và phân trang từ query
            const address = req.query.address ? JSON.parse(req.query.address as string) : undefined;
            const pageNum = req.query.pageNum ? parseInt(req.query.pageNum as string) : 1;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

            const staffRoles = await this.appointmentService.getUserRoleStaff(address, pageNum, pageSize);

            res.status(HttpStatus.Success).json(formatResponse(staffRoles));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get available slots for logged-in staff
     */

    public getStaffAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const staffId = req.user.id;
            if (!staffId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            const slots = await this.appointmentService.getStaffAvailableSlots(staffId);

            res.status(HttpStatus.Success).json(formatResponse<any[]>(slots));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get appointments assigned to staff
     */
    public getStaffAssignedAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const staffId = req.user.id;
            if (!staffId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Convert query parameters to SearchAppointmentDto format
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

            const appointments = await this.appointmentService.getStaffAssignedAppointments(staffId, searchParams);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IAppointment>>(appointments));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get appointments assigned to laboratory technician
     */
    public getLabTechAssignedAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const labTechId = req.user.id;
            if (!labTechId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Convert query parameters to SearchAppointmentDto format
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

            const appointments = await this.appointmentService.getLabTechAssignedAppointments(labTechId, searchParams);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IAppointment>>(appointments));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Assign laboratory technician to appointment
     */
    public assignLabTechnician = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { lab_tech_id } = req.body;
            const appointment = await this.appointmentService.assignLabTechnician(id, lab_tech_id);
            res.status(HttpStatus.Success).json(formatResponse<IAppointment>(appointment));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available laboratory technicians
     */
    public getAvailableLabTechnicians = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user.role;
            if (userRole !== UserRoleEnum.STAFF) {
                throw new HttpException(HttpStatus.Forbidden, 'Only staff can view laboratory technicians');
            }

            const labTechs = await this.appointmentService.getAvailableLabTechnicians();
            res.status(HttpStatus.Success).json(formatResponse<any[]>(labTechs));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Unassign staff from appointment
     * @route PUT /api/appointment/:id/unassign-staff
     */
    public unassignStaff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Kiểm tra quyền truy cập
            if (req.user.role !== UserRoleEnum.MANAGER && req.user.role !== UserRoleEnum.ADMIN) {
                throw new HttpException(HttpStatus.Forbidden, 'Only managers and admins can unassign staff from appointments');
            }

            const appointmentId = req.params.id;
            const appointment = await this.appointmentService.unassignStaff(appointmentId);

            res.status(HttpStatus.Success).json(formatResponse<IAppointment>(appointment, true, 'Staff unassigned successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Create consultation request (public endpoint - không cần authentication)
     */
    public createConsultation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const consultationData: CreateConsultationDto = req.body;
            const consultation = await this.appointmentService.createConsultation(consultationData);

            res.status(HttpStatus.Created).json(formatResponse<IConsultation>(consultation));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get consultation requests (for staff/admin)
     */
    public getConsultationRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const searchParams = req.query;
            const userRole = req.user?.role;
            const userId = req.user?.id;

            const consultations = await this.appointmentService.getConsultationRequests(
                searchParams,
                userRole,
                userId
            );

            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IConsultation>>(consultations));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get consultation by ID
     */
    public getConsultationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const consultation = await this.appointmentService.getConsultationById(id);

            res.status(HttpStatus.Success).json(formatResponse<IConsultation>(consultation));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Assign consultant to consultation (admin/manager only)
     */
    public assignConsultant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { consultant_id } = req.body;

            const consultation = await this.appointmentService.assignConsultant(id, consultant_id);

            res.status(HttpStatus.Success).json(formatResponse<IConsultation>(consultation));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update consultation status
     */
    public updateConsultationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const {
                status,
                meeting_link,
                meeting_notes,
                follow_up_required,
                follow_up_date,
                appointment_date
            } = req.body;

            const updateData = {
                meeting_link,
                meeting_notes,
                follow_up_required,
                follow_up_date: follow_up_date ? new Date(follow_up_date) : undefined,
                appointment_date: appointment_date ? new Date(appointment_date) : undefined
            };

            const consultation = await this.appointmentService.updateConsultationStatus(
                id,
                status as ConsultationStatusEnum,
                updateData
            );

            res.status(HttpStatus.Success).json(formatResponse<IConsultation>(consultation));
        } catch (error) {
            next(error);
        }
    };

}
