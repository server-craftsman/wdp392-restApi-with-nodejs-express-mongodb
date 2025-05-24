import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import SlotController from './slot.controller';
import { CreateSlotDto } from './dtos/createSlot.dto';
import { CreateMultipleSlotsDto } from './dtos/createMultipleSlots.dto';
import { UpdateSlotDto } from './dtos/updateSlot.dto';

export default class SlotRoute implements IRoute {
    public path = API_PATH.SLOT;
    public router = Router();
    private slotController = new SlotController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST: domain:/api/slot/create -> Create a single slot
        this.router.post(
            `${API_PATH.CREATE_SLOT}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            validationMiddleware(CreateSlotDto),
            this.slotController.createSlot
        );

        // POST: domain:/api/slot/create-multiple -> Create multiple slots
        // this.router.post(
        //     `${this.path}/create-multiple`,
        //     authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
        //     validationMiddleware(CreateMultipleSlotsDto),
        //     this.slotController.createMultipleSlots
        // );

        // GET: domain:/api/slot/search -> Search slots with filters
        this.router.get(
            `${API_PATH.SEARCH_SLOT}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.slotController.getSlots
        );

        // GET: domain:/api/slot/staff/:staffProfileId -> Get slots by staff
        this.router.get(
            `${API_PATH.GET_SLOT_BY_STAFF}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.slotController.getSlotsByStaff
        );

        // GET: domain:/api/slot/department/:departmentId -> Get slots by department
        this.router.get(
            `${API_PATH.GET_SLOT_BY_DEPARTMENT}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.slotController.getSlotsByDepartment
        );

        // GET: domain:/api/slot/:id -> Get slot by id
        this.router.get(
            `${API_PATH.GET_SLOT_BY_ID}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.slotController.getSlotById
        );

        // GET: domain:/api/slot/service/:serviceId -> Get slots by service
        this.router.get(
            `${API_PATH.GET_SLOT_BY_SERVICE}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF]),
            this.slotController.getSlotsByService
        );

        // PUT: domain:/api/slot/:id -> Update slot
        this.router.put(
            `${API_PATH.UPDATE_SLOT}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            validationMiddleware(UpdateSlotDto),
            this.slotController.updateSlot
        );

        // PATCH: domain:/api/slot/:id/status -> Change slot status
        this.router.patch(
            `${API_PATH.CHANGE_SLOT_STATUS}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.slotController.changeSlotStatus
        );

        // GET: domain:/api/department/:departmentId/statistics -> Get department performance statistics
        this.router.get(
            `${API_PATH.DEPARTMENT_STATISTICS}`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.slotController.getDepartmentPerformance
        );
    }
}
