import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import { UpdateSlotDto } from './dtos/updateSlot.dto';
import SlotService from './slot.service';
import { CreateSlotDto } from './dtos/createSlot.dto';
import { ISlot } from './slot.interface';
import { SearchPaginationResponseModel } from '../../core/models/searchPagination.model';

export default class SlotController {
    private slotService = new SlotService();

    /**
     * Tạo một slot mới
     */
    public createSlot = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const slotData: CreateSlotDto = req.body;
            const slot = await this.slotService.createSlot(slotData);
            res.status(HttpStatus.Created).json(formatResponse<ISlot>(slot));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Tạo nhiều slot cùng lúc theo mẫu
     */
    // public createMultipleSlots = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const slotsData: CreateMultipleSlotsDto = req.body;
    //         const result = await this.slotService.createMultipleSlots(slotsData);
    //         res.status(HttpStatus.Created).json({
    //             success: true,
    //             data: result
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // };

    /**
     * Tìm kiếm slots với các bộ lọc
     */
    public getSlots = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const slots = await this.slotService.getSlots(req.query);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ISlot>>(slots));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lấy slot theo ID
     */
    public getSlotById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const slotId = req.params.id;
            const slot = await this.slotService.getSlotById(slotId);
            res.status(HttpStatus.Success).json(formatResponse<ISlot>(slot));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Cập nhật thông tin slot
     */
    public updateSlot = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const slotId = req.params.id;
            const slotData: UpdateSlotDto = req.body;
            const slot = await this.slotService.updateSlot(slotId, slotData);
            res.status(HttpStatus.Success).json(formatResponse<ISlot>(slot));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Thay đổi trạng thái slot
     */
    public changeSlotStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const slotId = req.params.id;
            const { status } = req.body;

            if (!status) {
                throw new HttpException(HttpStatus.BadRequest, 'Status is required');
            }

            const slot = await this.slotService.changeSlotStatus(slotId, status);
            res.status(HttpStatus.Success).json(formatResponse<ISlot>(slot));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lấy slots của một nhân viên
     */
    public getSlotsByUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.id;

            if (!userId) {
                throw new HttpException(HttpStatus.BadRequest, 'User ID is required');
            }

            const slots = await this.slotService.getSlotsByUser(userId, req.query);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ISlot>>(slots));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lấy slots theo phòng ban
     */
    public getSlotsByDepartment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const departmentId = req.params.departmentId;
            const slots = await this.slotService.getSlotsByDepartment(departmentId, req.query);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ISlot>>(slots));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lấy slots theo dịch vụ
     */
    // public getSlotsByService = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const serviceId = req.params.serviceId;
    //         const slots = await this.slotService.getSlotsByService(serviceId, req.query);
    //         res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ISlot>>(slots));
    //     } catch (error) {
    //         next(error);
    //     }
    // };


    /**
     * Lấy thống kê performance của phòng ban
     */
    public getDepartmentPerformance = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const departmentId = req.params.departmentId;
            const { date_from, date_to } = req.query;
            const performanceStats = await this.slotService.getDepartmentPerformance(departmentId, { date_from, date_to });
            res.status(HttpStatus.Success).json(formatResponse(performanceStats));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lấy danh sách slots có sẵn để đặt lịch
     */
    public getAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { start_date, end_date, type } = req.query;

            if (!start_date) {
                throw new HttpException(HttpStatus.BadRequest, 'start_date is required');
            }

            const availableSlots = await this.slotService.getAvailableSlots({
                start_date: start_date as string,
                end_date: end_date as string,
                type: type as string
            });

            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ISlot>>(availableSlots));
        } catch (error) {
            next(error);
        }
    };
}