import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import { IRegistrationForm } from './registration_form.interface';
import RegistrationFormService from './registration_form.service';
import { CreateRegistrationFormDto } from './dtos/createRegistrationForm.dto';
import { UpdateRegistrationFormDto } from './dtos/updateRegistrationForm.dto';
import { UserRoleEnum } from '../user/user.enum';

export default class RegistrationFormController {
    private registrationFormService = new RegistrationFormService();

    /**
     * Create a new registration form (by laboratory technician)
     */
    public createRegistrationForm = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const laboratoryTechnicianId = req.user.id;
            const userRole = req.user.role;

            if (!laboratoryTechnicianId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Only laboratory technicians can create registration forms
            if (userRole !== UserRoleEnum.LABORATORY_TECHNICIAN) {
                throw new HttpException(HttpStatus.Forbidden, 'Only laboratory technicians can create registration forms');
            }

            const formData: CreateRegistrationFormDto = req.body;
            const form = await this.registrationFormService.createRegistrationForm(formData, laboratoryTechnicianId);

            res.status(HttpStatus.Created).json(formatResponse<IRegistrationForm>(form));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update an existing registration form (by laboratory technician)
     */
    public updateRegistrationForm = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const laboratoryTechnicianId = req.user.id;
            const userRole = req.user.role;
            const formId = req.params.id;

            if (!laboratoryTechnicianId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Only laboratory technicians can update registration forms
            if (userRole !== UserRoleEnum.LABORATORY_TECHNICIAN) {
                throw new HttpException(HttpStatus.Forbidden, 'Only laboratory technicians can update registration forms');
            }

            const updateData: UpdateRegistrationFormDto = req.body;
            const updatedForm = await this.registrationFormService.updateRegistrationForm(formId, updateData, laboratoryTechnicianId);

            res.status(HttpStatus.Success).json(formatResponse<IRegistrationForm>(updatedForm));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get registration form by ID (accessible by laboratory technician, staff, manager, admin)
     */
    public getRegistrationFormById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user.role;

            // Only staff, laboratory technicians, managers, and admins can view registration forms
            if (![UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN].includes(userRole)) {
                throw new HttpException(HttpStatus.Forbidden, 'You do not have permission to view registration forms');
            }

            const formId = req.params.id;
            const form = await this.registrationFormService.getRegistrationFormById(formId);

            res.status(HttpStatus.Success).json(formatResponse<IRegistrationForm>(form));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get registration form by sample ID (accessible by laboratory technician, staff, manager, admin)
     */
    public getRegistrationFormBySampleId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user.role;

            // Only staff, laboratory technicians, managers, and admins can view registration forms
            if (![UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN].includes(userRole)) {
                throw new HttpException(HttpStatus.Forbidden, 'You do not have permission to view registration forms');
            }

            const sampleId = req.params.sampleId;
            const form = await this.registrationFormService.getRegistrationFormBySampleId(sampleId);

            res.status(HttpStatus.Success).json(formatResponse<IRegistrationForm>(form));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get all registration forms with pagination (accessible by laboratory technician, staff, manager, admin)
     */
    public getAllRegistrationForms = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user.role;

            // Only staff, laboratory technicians, managers, and admins can view registration forms
            if (![UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN].includes(userRole)) {
                throw new HttpException(HttpStatus.Forbidden, 'You do not have permission to view registration forms');
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.registrationFormService.getAllRegistrationForms(page, limit);

            res.status(HttpStatus.Success).json(formatResponse(result));
        } catch (error) {
            next(error);
        }
    };
} 