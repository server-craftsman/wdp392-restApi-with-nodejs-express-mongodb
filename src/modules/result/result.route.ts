import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import ResultController from './result.controller';
import { CreateResultDto } from './dtos/createResult.dto';
import { UpdateResultDto } from './dtos/updateResult.dto';
import { StartTestingDto } from './dtos/startTesting.dto';

export default class ResultRoute implements IRoute {
    public path = API_PATH.RESULT;
    public router = Router();
    private resultController = new ResultController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST: domain:/api/result -> Create a new test result (laboratory technician only)
        this.router.post(
            `/`,
            authMiddleWare([UserRoleEnum.LABORATORY_TECHNICIAN]),
            validationMiddleware(CreateResultDto),
            this.resultController.createResult
        );

        // PUT: domain:/api/result/:id -> Update an existing test result (laboratory technician only)
        this.router.put(
            `/:id`,
            authMiddleWare([UserRoleEnum.LABORATORY_TECHNICIAN]),
            validationMiddleware(UpdateResultDto),
            this.resultController.updateResult
        );

        // GET: domain:/api/result/:id -> Get result by ID (all authenticated users)
        this.router.get(
            `/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.CUSTOMER]),
            this.resultController.getResultById
        );

        // GET: domain:/api/result/sample/:sampleId -> Get result by sample ID (all authenticated users)
        this.router.get(
            `/sample/:sampleId`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.CUSTOMER]),
            this.resultController.getResultBySampleId
        );

        // GET: domain:/api/result/appointment/:appointmentId -> Get result by appointment ID (all authenticated users)
        this.router.get(
            `/appointment/:appointmentId`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.CUSTOMER]),
            this.resultController.getResultByAppointmentId
        );

        // PUT: domain:/api/result/sample/:sampleId/start-testing -> Start testing process (laboratory technician only)
        this.router.put(
            `/sample/:sampleId/start-testing`,
            authMiddleWare([UserRoleEnum.LABORATORY_TECHNICIAN]),
            validationMiddleware(StartTestingDto),
            this.resultController.startTesting
        );
    }
} 