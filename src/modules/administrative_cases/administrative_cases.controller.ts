import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import AdministrativeCasesService from './administrative_cases.service';
import { UserRoleEnum } from '../user/user.enum';
import { CreateAdministrativeCaseDto, UpdateAdministrativeCaseDto } from './dtos/commonAdminCases.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export default class AdministrativeCasesController {
    private administrativeCasesService = new AdministrativeCasesService();

    public createCase = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }

            // Transform and validate request body
            const dto = plainToClass(CreateAdministrativeCaseDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                const errorMessages = errors.map((error) => Object.values(error.constraints || {}).join(', ')).join('; ');
                throw new HttpException(HttpStatus.BadRequest, `Validation failed: ${errorMessages}`);
            }

            const applicantId = req.user.id;
            const result = await this.administrativeCasesService.createCase(dto, applicantId);

            res.status(HttpStatus.Created).json(formatResponse(result, true, 'Administrative case created successfully'));
        } catch (error) {
            next(error);
        }
    };

    public getCaseById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;

            if (!id) {
                throw new HttpException(HttpStatus.BadRequest, 'Case ID is required');
            }

            const result = await this.administrativeCasesService.getCaseById(id);

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Administrative case not found');
            }

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Administrative case retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    public updateCase = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }

            const id = req.params.id;

            if (!id) {
                throw new HttpException(HttpStatus.BadRequest, 'Case ID is required');
            }

            // Transform and validate request body
            const dto = plainToClass(UpdateAdministrativeCaseDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                const errorMessages = errors.map((error) => Object.values(error.constraints || {}).join(', ')).join('; ');
                throw new HttpException(HttpStatus.BadRequest, `Validation failed: ${errorMessages}`);
            }

            const result = await this.administrativeCasesService.updateCase(id, dto);

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Administrative case not found');
            }

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Administrative case updated successfully'));
        } catch (error) {
            next(error);
        }
    };

    public deleteCase = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }

            const id = req.params.id;

            if (!id) {
                throw new HttpException(HttpStatus.BadRequest, 'Case ID is required');
            }

            const result = await this.administrativeCasesService.deleteCase(id);

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Administrative case not found');
            }

            res.status(HttpStatus.Success).json(formatResponse(null, true, 'Administrative case deleted successfully'));
        } catch (error) {
            next(error);
        }
    };

    public listCases = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }

            const result = await this.administrativeCasesService.listCases(req.query);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Administrative cases retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    public searchCases = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }

            const searchParams = {
                case_number: req.query.case_number as string,
                case_type: req.query.case_type as string,
                status: req.query.status as string,
                requesting_agency: req.query.requesting_agency as string,
                agency_contact_email: req.query.agency_contact_email as string,
                created_by_user_id: req.query.created_by_user_id as string,
                assigned_staff_id: req.query.assigned_staff_id as string,
                from_date: req.query.from_date ? new Date(req.query.from_date as string) : undefined,
                to_date: req.query.to_date ? new Date(req.query.to_date as string) : undefined,
            };

            const result = await this.administrativeCasesService.searchCases(searchParams);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Administrative cases search completed'));
        } catch (error) {
            next(error);
        }
    };

    public getCaseByCaseNumber = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }

            const caseNumber = req.params.caseNumber;

            if (!caseNumber) {
                throw new HttpException(HttpStatus.BadRequest, 'Case number is required');
            }

            const result = await this.administrativeCasesService.getCaseByCaseNumber(caseNumber);

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Administrative case not found');
            }

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Administrative case retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    public updateCaseStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }

            const id = req.params.id;
            const { status } = req.body;

            if (!id) {
                throw new HttpException(HttpStatus.BadRequest, 'Case ID is required');
            }

            if (!status) {
                throw new HttpException(HttpStatus.BadRequest, 'Status is required');
            }

            const result = await this.administrativeCasesService.updateCaseStatus(id, status);

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Administrative case not found');
            }

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Administrative case status updated successfully'));
        } catch (error) {
            next(error);
        }
    };

    public generateCaseNumber = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }

            const sequential = req.query.sequential === 'true';

            let caseNumber: string;
            if (sequential) {
                caseNumber = await this.administrativeCasesService.generateSequentialCaseNumber();
            } else {
                caseNumber = this.administrativeCasesService.generateCaseNumber();
            }

            res.status(HttpStatus.Success).json(formatResponse({ case_number: caseNumber }, true, 'Case number generated successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get assigned cases for staff/labtech (limited view)
     * Staff/LabTech can only see cases assigned to them and specific case types
     */
    public getAssignedCases = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user.role;
            const userId = req.user.id;

            // Check if user is staff or lab technician
            if (![UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN].includes(userRole)) {
                throw new HttpException(HttpStatus.Forbidden, 'Access denied. Only Staff and Laboratory Technicians can view assigned cases.');
            }

            const result = await this.administrativeCasesService.getAssignedCasesForStaff(userId, userRole);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Assigned administrative cases retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Search assigned cases for staff/labtech (limited view)
     */
    public searchAssignedCases = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user.role;
            const userId = req.user.id;

            // Check if user is staff or lab technician
            if (![UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN].includes(userRole)) {
                throw new HttpException(HttpStatus.Forbidden, 'Access denied. Only Staff and Laboratory Technicians can search assigned cases.');
            }

            const searchParams = {
                case_number: req.query.case_number as string,
                case_type: req.query.case_type as string,
                status: req.query.status as string,
                requesting_agency: req.query.requesting_agency as string,
                from_date: req.query.from_date ? new Date(req.query.from_date as string) : undefined,
                to_date: req.query.to_date ? new Date(req.query.to_date as string) : undefined,
            };

            const result = await this.administrativeCasesService.searchAssignedCasesForStaff(userId, searchParams);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Assigned administrative cases search completed'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Assign case to staff/labtech (Admin/Manager only)
     */
    public assignCaseToStaff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied. Only Admin and Manager can assign cases.');
            }

            const caseId = req.params.id;
            const { assigned_staff_id } = req.body;

            if (!caseId) {
                throw new HttpException(HttpStatus.BadRequest, 'Case ID is required');
            }

            if (!assigned_staff_id) {
                throw new HttpException(HttpStatus.BadRequest, 'Staff ID is required');
            }

            const result = await this.administrativeCasesService.assignStaff(caseId, assigned_staff_id);

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Administrative case not found');
            }

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Case assigned to staff successfully'));
        } catch (error) {
            next(error);
        }
    };
}
