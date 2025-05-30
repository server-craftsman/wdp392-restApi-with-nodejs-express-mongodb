import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import { IKit } from './kit.interface';
import { CreateKitDto } from './dtos/createKit.dto';
import { UpdateKitDto } from './dtos/updateKit.dto';
import { SearchKitDto } from './dtos/searchKit.dto';
import { ReturnKitDto } from './dtos/returnKit.dto';
import KitService from './kit.service';
import { SearchPaginationResponseModel } from '../../core/models/searchPagination.model';

export default class KitController {
    private kitService = new KitService();

    /**
     * Create a new kit with auto-generated code
     */
    public createKit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Clone the request body to avoid reference issues
            const kitData: CreateKitDto = req.body ? { ...req.body } : undefined;

            // Call service method with explicit error handling
            const kit = await this.kitService.createKit(kitData);

            if (!kit) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to create kit');
            }

            res.status(HttpStatus.Created).json(formatResponse<IKit>(kit));
        } catch (error) {
            console.error('Error in createKit controller:', error);
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

            res.status(HttpStatus.Success).json(formatResponse<IKit>(kit));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Search kits
     */
    public searchKits = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const searchParams: SearchKitDto = req.query as any;
            const searchResult = await this.kitService.searchKits(searchParams);

            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IKit>>(searchResult));
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
            const kitData: UpdateKitDto = req.body;
            const updatedKit = await this.kitService.updateKit(kitId, kitData);

            res.status(HttpStatus.Success).json(formatResponse<IKit>(updatedKit));
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

            res.status(HttpStatus.Success).json(formatResponse<string>('Kit deleted successfully'));
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
            const updatedKit = await this.kitService.changeKitStatus(kitId, status);

            res.status(HttpStatus.Success).json(formatResponse<IKit>(updatedKit));
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

            res.status(HttpStatus.Success).json(formatResponse<IKit[]>(kits));
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
            const { notes } = req.body;

            const kit = await this.kitService.returnKit(kitId, notes);

            res.status(HttpStatus.Success).json(formatResponse<IKit>(kit));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Assign a kit to a laboratory technician
     */
    public assignKit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const kitId = req.params.id;
            const { appointment_id, laboratory_technician_id } = req.body;

            const kit = await this.kitService.assignKit(
                kitId,
                appointment_id,
                laboratory_technician_id
            );

            res.status(HttpStatus.Success).json(formatResponse<IKit>(kit));
        } catch (error) {
            next(error);
        }
    };
} 