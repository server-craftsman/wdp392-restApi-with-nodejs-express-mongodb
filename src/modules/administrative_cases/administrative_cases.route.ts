import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import AdministrativeCasesController from './administrative_cases.controller';
import { CreateAdministrativeCaseDto } from './dtos/commonAdminCases.dto';

export default class AdministrativeCasesRouter implements IRoute {
    public path = API_PATH.ADMINISTRATIVE_CASES;
    public router = Router();
    private administrativeCasesController = new AdministrativeCasesController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET: domain:/api/administrative-cases/search -> Search administrative cases
        this.router.get(`${this.path}/search`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]), this.administrativeCasesController.searchCases);

        // GET: domain:/api/administrative-cases/generate-case-number -> Generate case number
        this.router.get(`${this.path}/generate-case-number`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.administrativeCasesController.generateCaseNumber);

        // GET: domain:/api/administrative-cases/case-number/:caseNumber -> Get case by case number
        this.router.get(`${this.path}/case-number/:caseNumber`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]), this.administrativeCasesController.getCaseByCaseNumber);

        // POST: domain:/api/administrative-cases -> Create administrative case
        this.router.post(
            `${this.path}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            // validationMiddleware(CreateAdministrativeCaseDto),
            this.administrativeCasesController.createCase,
        );

        // PUT: domain:/api/administrative-cases/:id/status -> Update administrative case status
        this.router.put(`${this.path}/:id/status`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.administrativeCasesController.updateCaseStatus);

        // PUT: domain:/api/administrative-cases/:id/assign -> Assign case to staff/labtech
        this.router.put(`${this.path}/:id/assign`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.administrativeCasesController.assignCaseToStaff);

        // GET: domain:/api/administrative-cases/:id -> Get administrative case by id
        this.router.get(`${this.path}/:id`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]), this.administrativeCasesController.getCaseById);

        // PUT: domain:/api/administrative-cases/:id -> Update administrative case
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            // validationMiddleware(CreateAdministrativeCaseDto),
            this.administrativeCasesController.updateCase,
        );

        // DELETE: domain:/api/administrative-cases/:id -> Delete administrative case
        this.router.delete(`${this.path}/:id`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.administrativeCasesController.deleteCase);

        // GET: domain:/api/administrative-cases -> Get all administrative cases
        this.router.get(`${this.path}`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.administrativeCasesController.listCases);

        // === STAFF/LABTECH ROUTES ===
        // GET: domain:/api/administrative-cases/assigned -> Get assigned cases for staff/labtech
        this.router.get(`${this.path}/assigned`, authMiddleWare([UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]), this.administrativeCasesController.getAssignedCases);

        // GET: domain:/api/administrative-cases/assigned/search -> Search assigned cases for staff/labtech
        this.router.get(`${this.path}/assigned/search`, authMiddleWare([UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]), this.administrativeCasesController.searchAssignedCases);

        // GET: domain:/api/administrative-cases/staff/available -> Get available staff members for assignment
        this.router.get(`${this.path}/staff/available`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.administrativeCasesController.getAvailableStaffMembers);
    }
}
