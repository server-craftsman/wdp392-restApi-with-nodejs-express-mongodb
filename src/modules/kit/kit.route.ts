import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import KitController from './kit.controller';
import { CreateKitDto } from './dtos/createKit.dto';
import { UpdateKitDto } from './dtos/updateKit.dto';
import { ReturnKitDto } from './dtos/returnKit.dto';
import { AssignKitDto } from './dtos/assignKit.dto';

export default class KitRoute implements IRoute {
    public path = API_PATH.KIT;
    public router = Router();
    private kitController = new KitController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET: domain:/api/kit/search -> Search kits
        this.router.get(
            `${API_PATH.SEARCH_KIT}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.kitController.searchKits
        );

        // GET: domain:/api/kit/available -> Get available kits
        this.router.get(
            `${API_PATH.GET_AVAILABLE_KITS}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.kitController.getAvailableKits
        );

        // GET: domain:/api/kit/:id -> Get kit by ID
        this.router.get(
            `${API_PATH.GET_KIT_BY_ID}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.kitController.getKitById
        );

        // POST: domain:/api/kit/create -> Create a kit
        this.router.post(
            `${API_PATH.CREATE_KIT}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.kitController.createKit
        );

        // PUT: domain:/api/kit/:id -> Update a kit
        this.router.put(
            `${API_PATH.UPDATE_KIT}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            validationMiddleware(UpdateKitDto),
            this.kitController.updateKit
        );

        // POST: domain:/api/kit/:id/assign -> Assign a kit to a laboratory technician
        this.router.post(
            `${API_PATH.ASSIGN_KIT}`,
            authMiddleWare([UserRoleEnum.STAFF]),
            validationMiddleware(AssignKitDto),
            this.kitController.assignKit
        );

        // PATCH: domain:/api/kit/:id/status -> Change kit status
        this.router.patch(
            `${API_PATH.CHANGE_KIT_STATUS}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.kitController.changeKitStatus
        );

        // DELETE: domain:/api/kit/:id -> Delete a kit
        this.router.delete(
            `${API_PATH.DELETE_KIT}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.kitController.deleteKit
        );

        // POST: domain:/api/kit/:id/return -> Return a kit
        this.router.post(
            `${API_PATH.RETURN_KIT}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.kitController.returnKit
        );
    }
} 