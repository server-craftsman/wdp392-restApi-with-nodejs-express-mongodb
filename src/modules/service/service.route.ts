import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware, uploadSingleFile } from '../../core/middleware';
import ServiceController from './service.controller';
import CreateServiceDto from './dtos/createService.dto';
import UpdateServiceDto from './dtos/updateService.dto';
import { SampleMethods, ServiceTypes } from './service.constant';
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
        this.router.post(API_PATH.CREATE_SERVICE, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), uploadSingleFile('service_image'), validationMiddleware(CreateServiceDto), this.serviceController.createService);

        // GET: domain:/api/service/search -> Get all services
        this.router.get(API_PATH.SEARCH_SERVICE, authMiddleWare([], true), this.serviceController.getServices);

        // GET: domain:/api/service/statistics -> Đếm số lượng dịch vụ theo loại
        this.router.get(`${this.path}/statistics`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.serviceController.countServicesByType);

        // GET: domain:/api/service/appointments -> Lấy các dịch vụ dựa trên thông tin cuộc hẹn
        this.router.get(`${this.path}/appointments`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]), this.serviceController.getServicesByAppointment);

        // GET: domain:/api/service/:id -> Get service by id
        this.router.get(API_PATH.GET_SERVICE_BY_ID, authMiddleWare([], true), this.serviceController.getServiceById);

        // GET: domain:/api/service/slug/:slug -> Get service by slug
        this.router.get(`${this.path}/slug/:slug`, authMiddleWare([], true), this.serviceController.getServiceBySlug);

        // GET: domain:/api/service/:id/child -> Get child services by id
        this.router.get(`${this.path}/:id/child`, authMiddleWare([], true), this.serviceController.getChildServices);

        // PUT: domain:/api/service/:id -> Update service by id
        this.router.put(API_PATH.UPDATE_SERVICE, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), uploadSingleFile('service_image'), validationMiddleware(UpdateServiceDto), this.serviceController.updateService);

        // PATCH: domain:/api/service/:id/status -> Thay đổi trạng thái hoạt động của dịch vụ
        this.router.patch(`${this.path}/:id/status`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.serviceController.changeServiceStatus);

        // DELETE: domain:/api/service/:id -> Delete service by id
        this.router.delete(API_PATH.DELETE_SERVICE, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.serviceController.deleteService);

        // GET: domain:/api/service/services-with-images -> Get all services with images
        this.router.get(`${this.path}/services-with-images`, authMiddleWare([], true), this.serviceController.getServicesWithImages);
    }
}
