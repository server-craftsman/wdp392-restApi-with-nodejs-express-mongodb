import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import AppointmentController from './appointment.controller';
import { CreateAppointmentDto } from './dtos/createAppointment.dto';
import { AssignStaffDto } from './dtos/assign-staff.dto';
import { ConfirmAppointmentDto } from './dtos/confirm-appointment.dto';

export default class AppointmentRoute implements IRoute {
    public path = API_PATH.APPOINTMENT;
    public router = Router();
    private appointmentController = new AppointmentController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET: domain:/api/appointment/search -> Search appointments with filters
        this.router.get(
            `${this.path}/search`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.CUSTOMER, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.appointmentController.searchAppointments
        );

        // POST: domain:/api/appointment/create -> Create a new appointment
        this.router.post(
            `${API_PATH.CREATE_APPOINTMENT}`,
            authMiddleWare([UserRoleEnum.CUSTOMER]), // Only customers can create appointments
            validationMiddleware(CreateAppointmentDto),
            this.appointmentController.createAppointment
        );

        // GET: domain:/api/appointment/:id -> Get appointment by ID
        this.router.get(
            `${API_PATH.GET_APPOINTMENT_BY_ID}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.CUSTOMER, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.appointmentController.getAppointmentById
        );

        // GET: domain:/api/appointment/:id/samples -> Get samples for an appointment
        this.router.get(
            `${this.path}/:id/samples`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.CUSTOMER, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.appointmentController.getAppointmentSamples
        );

        // PUT: domain:/api/appointment/:id/assign-staff -> Assign staff to appointment
        this.router.put(
            `${API_PATH.ASSIGN_STAFF_TO_APPOINTMENT}`,
            authMiddleWare([UserRoleEnum.MANAGER]), // Only managers can assign staff
            validationMiddleware(AssignStaffDto),
            this.appointmentController.assignStaff
        );

        // PUT: domain:/api/appointment/:id/confirm -> Confirm appointment and assign kit
        this.router.put(
            `${API_PATH.CONFIRM_APPOINTMENT}`,
            authMiddleWare([UserRoleEnum.STAFF]), // Only staff can confirm appointments
            validationMiddleware(ConfirmAppointmentDto),
            this.appointmentController.confirmAppointment
        );

        // GET: domain:/api/appointment/:appointmentId/price -> Get price for an appointment
        this.router.get(
            `${this.path}/:appointmentId/price`,
            authMiddleWare(),
            this.appointmentController.getAppointmentPrice
        );

        // GET: domain:/api/appointment/staff/available -> Get available staff
        this.router.get(
            `${this.path}/staff/available`,
            authMiddleWare([UserRoleEnum.MANAGER]),
            this.appointmentController.getStaffRoles
        );

        // GET: domain:/api/appointment/staff/slots -> Get available slots for logged-in staff
        this.router.get(
            `${this.path}/staff/slots`,
            authMiddleWare([UserRoleEnum.STAFF]),
            this.appointmentController.getStaffAvailableSlots
        );

        // GET: domain: /api/appointments/staff/assigned -> Get appointments assigned to staff
        this.router.get(
            `${this.path}/staff/assigned`,
            authMiddleWare([UserRoleEnum.STAFF]),
            this.appointmentController.getStaffAssignedAppointments
        );

        // GET: domain: /api/appointments/lab-tech/assigned -> Get appointments assigned to laboratory technician
        this.router.get(
            `${this.path}/lab-tech/assigned`,
            authMiddleWare([UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.appointmentController.getLabTechAssignedAppointments
        );

        // POST: domain: /api/appointments/:id/assign-lab-tech -> Assign laboratory technician to appointment
        this.router.post(
            `${this.path}/:id/assign-lab-tech`,
            authMiddleWare([UserRoleEnum.STAFF]),
            this.appointmentController.assignLabTechnician
        );

        // GET: domain: /api/appointment/lab-tech/available -> Get available laboratory technicians
        this.router.get(
            `${this.path}/lab-tech/available`,
            authMiddleWare([UserRoleEnum.STAFF]),
            this.appointmentController.getAvailableLabTechnicians
        );

        // PUT domain:/api/appointment/:id/assign-staff -> Assign staff to an appointment
        this.router.put(
            `${this.path}/:id/assign-staff`,
            authMiddleWare([UserRoleEnum.MANAGER, UserRoleEnum.ADMIN]),
            validationMiddleware(AssignStaffDto),
            this.appointmentController.assignStaff
        );

        // PUT domain:/api/appointment/:id/unassign-staff -> Unassign staff from an appointment
        this.router.put(
            `${this.path}/:id/unassign-staff`,
            authMiddleWare([UserRoleEnum.MANAGER, UserRoleEnum.ADMIN]),
            this.appointmentController.unassignStaff
        );
    }
} 