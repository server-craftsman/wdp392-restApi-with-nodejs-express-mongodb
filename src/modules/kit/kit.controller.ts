import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import { IKit } from './kit.interface';
import { CreateKitDto } from './dtos/createKit.dto';
import { UpdateKitDto } from './dtos/updateKit.dto';
import { SearchKitDto } from './dtos/searchKit.dto';
import { ReturnKitDto } from './dtos/returnKit.dto';
import { AssignKitDto } from './dtos/assignKit.dto';
import KitService from './kit.service';
import { SearchPaginationResponseModel } from '../../core/models/searchPagination.model';
import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { KitStatusEnum } from './kit.enum';

export default class KitController {
    private kitService = new KitService();

    /**
     * Create a new kit with auto-generated code
     */
    public createKit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate DTO
            const dto = plainToClass(CreateKitDto, req.body);
            await validateOrReject(dto);

            const kit = await this.kitService.createKit(dto);
            res.status(HttpStatus.Created).json(formatResponse<IKit>(kit, true, 'Kit created successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get kit by ID
     */
    public getKitById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const kitId = req.params.id;
            const kit = await this.kitService.getKitById(kitId);

            res.status(HttpStatus.Success).json(formatResponse<IKit>(kit, true, 'Kit retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Search kits
     */
    public searchKits = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate DTO
            const dto = plainToClass(SearchKitDto, req.query);
            await validateOrReject(dto);

            const searchResult = await this.kitService.searchKits(dto);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IKit>>(searchResult, true, 'Kits retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update kit
     */
    public updateKit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const kitId = req.params.id;

            // Validate DTO
            const dto = plainToClass(UpdateKitDto, req.body);
            await validateOrReject(dto);

            const updatedKit = await this.kitService.updateKit(kitId, dto);
            res.status(HttpStatus.Success).json(formatResponse<IKit>(updatedKit, true, 'Kit updated successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Delete kit
     */
    public deleteKit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const kitId = req.params.id;
            await this.kitService.deleteKit(kitId);

            res.status(HttpStatus.Success).json(formatResponse<string>('Kit deleted successfully', true, 'Kit deleted successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Change kit status
     */
    public changeKitStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const kitId = req.params.id;
            const { status } = req.body;

            // Validate status
            if (!Object.values(KitStatusEnum).includes(status)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid kit status');
            }

            const updatedKit = await this.kitService.changeKitStatus(kitId, status);
            res.status(HttpStatus.Success).json(formatResponse<IKit>(updatedKit, true, 'Kit status updated successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get available kits
     */
    public getAvailableKits = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const kits = await this.kitService.getAvailableKits();
            res.status(HttpStatus.Success).json(formatResponse<IKit[]>(kits, true, 'Available kits retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Return a kit
     */
    public returnKit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const kitId = req.params.id;

            // Validate DTO
            const dto = plainToClass(ReturnKitDto, req.body);
            await validateOrReject(dto);

            const kit = await this.kitService.returnKit(kitId, dto);
            res.status(HttpStatus.Success).json(formatResponse<IKit>(kit, true, 'Kit returned successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Assign a kit to an appointment
     */
    public assignKit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const kitId = req.params.id;

            // Validate DTO
            const dto = plainToClass(AssignKitDto, req.body);
            await validateOrReject(dto);

            const kit = await this.kitService.assignKit(kitId, dto);
            res.status(HttpStatus.Success).json(formatResponse<IKit>(kit, true, 'Kit assigned successfully'));
        } catch (error) {
            next(error);
        }
    };
}
