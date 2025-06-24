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
        // POST: domain:/api/administrative-cases -> Create administrative case
        this.router.post(
            `${this.path}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            // validationMiddleware(CreateAdministrativeCaseDto),
            this.administrativeCasesController.createCase
        );

        // GET: domain:/api/administrative-cases/:id -> Get administrative case by id
        this.router.get(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.administrativeCasesController.getCaseById
        );

        // PUT: domain:/api/administrative-cases/:id -> Update administrative case
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            // validationMiddleware(CreateAdministrativeCaseDto),
            this.administrativeCasesController.updateCase
        );

        // DELETE: domain:/api/administrative-cases/:id -> Delete administrative case
        this.router.delete(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.administrativeCasesController.deleteCase
        );

        // GET: domain:/api/administrative-cases -> Get all administrative cases
        this.router.get(
            `${this.path}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.administrativeCasesController.listCases
        );
    }
}


