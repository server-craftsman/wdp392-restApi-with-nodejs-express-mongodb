import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import StaffProfileController from './staff_profile.controller';
import CreateStaffProfileDto from './dtos/createStaffProfile.dto';
import UpdateStaffProfileDto from './dtos/updateStaffProfile.dto';
import { UserRoleEnum } from '../user/user.enum';


export default class StaffProfileRoute implements IRoute {
    public path = API_PATH.STAFF_PROFILE;
    public router = Router();
    private staffProfileController = new StaffProfileController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST: domain: /api/staff-profile/create -> Create staff profile
        this.router.post(
            `${this.path}/create`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            validationMiddleware(CreateStaffProfileDto),
            this.staffProfileController.createStaffProfile
        );

        // GET: domain: /api/staff-profile/search -> Get all staff profiles
        this.router.get(
            `${this.path}/search`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.staffProfileController.getStaffProfiles
        );

        // GET: domain: /api/staff-profile/department/:id -> Get staff profiles by department id
        this.router.get(
            `${this.path}/department/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.staffProfileController.getStaffProfilesByDepartment
        );

        // GET: domain: /api/staff-profile/:id -> Get staff profile by id
        this.router.get(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.staffProfileController.getStaffProfileById
        );

        // PUT: domain: /api/staff-profile/:id -> Update staff profile
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            validationMiddleware(UpdateStaffProfileDto),
            this.staffProfileController.updateStaffProfile
        );

        // PUT: domain: /api/staff-profile/:id/status -> Change staff status
        this.router.put(
            `${this.path}/:id/status`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.staffProfileController.changeStaffStatus
        );

    }
}





