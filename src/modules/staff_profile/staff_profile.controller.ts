import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import StaffProfileService from './staff_profile.service';
import CreateStaffProfileDto from './dtos/createStaffProfile.dto';
import UpdateStaffProfileDto from './dtos/updateStaffProfile.dto';
import { IStaffProfile } from './staff_profile.interface';
import { SearchPaginationResponseModel } from '../../core/models/searchPagination.model';
import { HttpException } from '../../core/exceptions';

export default class StaffProfileController {
    private staffProfileService = new StaffProfileService();

    public createStaffProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateStaffProfileDto = req.body;
            const staffProfile = await this.staffProfileService.createStaffProfile(model);
            res.status(HttpStatus.Created).json(formatResponse<IStaffProfile>(staffProfile));
        } catch (error) {
            next(error);
        }
    };

    public getStaffProfiles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const queryParams = req.query;
            const staffProfiles = await this.staffProfileService.getStaffProfiles(queryParams);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IStaffProfile>>(staffProfiles));
        } catch (error) {
            next(error);
        }
    };

    public getStaffProfilesByDepartment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const queryParams = req.query;
            const staffProfiles = await this.staffProfileService.getStaffProfilesByDepartment(id, queryParams);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IStaffProfile>>(staffProfiles));
        } catch (error) {
            next(error);
        }
    };

    public getStaffProfileById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const staffProfile = await this.staffProfileService.getStaffProfileById(id);
            res.status(HttpStatus.Success).json(formatResponse<IStaffProfile>(staffProfile));
        } catch (error) {
            next(error);
        }
    };

    public updateStaffProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const model: UpdateStaffProfileDto = req.body;
            const staffProfile = await this.staffProfileService.updateStaffProfile(id, model);
            res.status(HttpStatus.Success).json(formatResponse<IStaffProfile>(staffProfile));
        } catch (error) {
            next(error);
        }
    };

    public changeStaffStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const staffProfile = await this.staffProfileService.changeStaffStatus(id, status);
            res.status(HttpStatus.Success).json(formatResponse<IStaffProfile>(staffProfile));
        } catch (error) {
            next(error);
        }
    };
}
