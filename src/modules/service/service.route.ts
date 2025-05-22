import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import ServiceController from './service.controller';
import CreateServiceDto from './dtos/createService.dto';
import UpdateServiceDto from './dtos/updateService.dto';
import { SampleMethods, ServiceTypes } from './service.constant'
import { UserRoleEnum } from '../user/user.enum';

export default class ServiceRoute implements IRoute {
    public path = API_PATH.SERVICE;
    public router = Router();
    private serviceController = new ServiceController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // POST: domain:/api/service/create -> Create service
        this.router.post(
            API_PATH.CREATE_SERVICE,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(CreateServiceDto),
            this.serviceController.createService);

        // GET: domain:/api/service/search -> Get all services
        this.router.get(
            API_PATH.SEARCH_SERVICE,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.serviceController.getServices);

        // GET: domain:/api/service/:id -> Get service by id
        this.router.get(
            API_PATH.GET_SERVICE_BY_ID,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.serviceController.getServiceById);

        // PUT: domain:/api/service/:id -> Update service by id
        this.router.put(
            API_PATH.UPDATE_SERVICE,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(UpdateServiceDto),
            this.serviceController.updateService);

        // DELETE: domain:/api/service/:id -> Delete service by id
        this.router.delete(
            API_PATH.DELETE_SERVICE,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.serviceController.deleteService);

    }
}
