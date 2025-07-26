import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import DepartmentService from './department.service';
import CreateDepartmentDto from './dtos/createDepartment.dto';
import UpdateDepartmentDto from './dtos/updateDepartment.dto';
import { IDepartment } from './department.interface';
import { SearchPaginationResponseModel } from '../../core/models/searchPagination.model';

export default class DepartmentController {
    private departmentService = new DepartmentService();

    /**
     * Tạo phòng ban mới
     */
    public createDepartment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateDepartmentDto = req.body;
            const department = await this.departmentService.createDepartment(model);
            res.status(HttpStatus.Created).json(formatResponse<IDepartment>(department));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lấy danh sách phòng ban
     */
    public getDepartments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const departments = await this.departmentService.getDepartments(req.query);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IDepartment>>(departments));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lấy thông tin phòng ban theo ID
     */
    public getDepartmentById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const department = await this.departmentService.getDepartmentById(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<IDepartment>(department));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Cập nhật thông tin phòng ban
     */
    public updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: UpdateDepartmentDto = req.body;
            const department = await this.departmentService.updateDepartment(req.params.id, model);
            res.status(HttpStatus.Success).json(formatResponse<IDepartment>(department));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Xóa phòng ban
     */
    public deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.departmentService.deleteDepartment(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<string>('Delete department successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lấy danh sách phòng ban của một manager
     */
    public getManagerDepartments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const managerId = req.params.managerId;
            const result = await this.departmentService.getManagerDepartments(managerId, req.query);
            res.status(HttpStatus.Success).json(formatResponse(result));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Đếm tổng số phòng ban trong hệ thống
     */
    public countDepartments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.departmentService.countDepartments(req.query);
            res.status(HttpStatus.Success).json(
                formatResponse({
                    totalDepartments: count,
                }),
            );
        } catch (error) {
            next(error);
        }
    };
}
