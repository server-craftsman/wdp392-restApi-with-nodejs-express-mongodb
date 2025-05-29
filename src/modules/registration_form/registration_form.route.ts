import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import RegistrationFormController from './registration_form.controller';
import { CreateRegistrationFormDto } from './dtos/createRegistrationForm.dto';
import { UpdateRegistrationFormDto } from './dtos/updateRegistrationForm.dto';

export default class RegistrationFormRoute implements IRoute {
    public path = API_PATH.REGISTRATION_FORM;
    public router = Router();
    private registrationFormController = new RegistrationFormController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST: domain:/api/registration-form -> Create a new registration form (laboratory technician only)
        this.router.post(
            `/`,
            authMiddleWare([UserRoleEnum.LABORATORY_TECHNICIAN]),
            validationMiddleware(CreateRegistrationFormDto),
            this.registrationFormController.createRegistrationForm
        );

        // PUT: domain:/api/registration-form/:id -> Update an existing registration form (laboratory technician only)
        this.router.put(
            `/:id`,
            authMiddleWare([UserRoleEnum.LABORATORY_TECHNICIAN]),
            validationMiddleware(UpdateRegistrationFormDto),
            this.registrationFormController.updateRegistrationForm
        );

        // GET: domain:/api/registration-form/:id -> Get registration form by ID (staff, laboratory technician, manager, admin)
        this.router.get(
            `/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.registrationFormController.getRegistrationFormById
        );

        // GET: domain:/api/registration-form/sample/:sampleId -> Get registration form by sample ID (staff, laboratory technician, manager, admin)
        this.router.get(
            `/sample/:sampleId`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.registrationFormController.getRegistrationFormBySampleId
        );

        // GET: domain:/api/registration-form -> Get all registration forms with pagination (staff, laboratory technician, manager, admin)
        this.router.get(
            `/`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.registrationFormController.getAllRegistrationForms
        );
    }
} 