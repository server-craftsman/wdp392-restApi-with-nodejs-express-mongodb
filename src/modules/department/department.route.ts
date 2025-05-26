import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import DepartmentController from './department.controller';
import CreateDepartmentDto from './dtos/createDepartment.dto';
import UpdateDepartmentDto from './dtos/updateDepartment.dto';
import { UserRoleEnum } from '../user/user.enum';

export default class DepartmentRoute implements IRoute {
    public path = API_PATH.DEPARTMENT;
    public router = Router();
    private departmentController = new DepartmentController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST: domain:/api/department/create -> Create department
        this.router.post(
            `${this.path}/create`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(CreateDepartmentDto),
            this.departmentController.createDepartment
        );

        // GET: domain:/api/department/search -> Get all departments with pagination
        this.router.get(
            API_PATH.SEARCH_DEPARTMENT,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.STAFF]),
            this.departmentController.getDepartments
        );

        // GET: domain:/api/department/manager/:managerId -> Get departments by manager ID
        this.router.get(
            `${this.path}/manager/:managerId`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.departmentController.getManagerDepartments
        );

        // GET: domain:/api/department/count -> Count all departments
        this.router.get(
            `${this.path}/count`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            this.departmentController.countDepartments
        );

        // GET: domain:/api/department/:id -> Get department by ID
        this.router.get(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.STAFF]),
            this.departmentController.getDepartmentById
        );

        // PUT: domain:/api/department/:id -> Update department
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]),
            validationMiddleware(UpdateDepartmentDto),
            this.departmentController.updateDepartment
        );

        // DELETE: domain:/api/department/:id -> Delete department
        this.router.delete(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.departmentController.deleteDepartment
        );
    }
}