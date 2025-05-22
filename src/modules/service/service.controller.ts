import { NextFunction, Request, Response } from 'express';
import { API_PATH } from '../../core/constants';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import ServiceService from './service.service';
import CreateServiceDto from './dtos/createService.dto';
import { IService } from './service.interface';


export default class ServiceController {
    private serviceService = new ServiceService();

    public createService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateServiceDto = req.body;
            const service = await this.serviceService.createService(model);
            res.status(HttpStatus.Created).json(formatResponse<IService>(service));
        } catch (error) {
            next(error);
        }
    }

    public getServices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const services = await this.serviceService.getServices();
            res.status(HttpStatus.Success).json(formatResponse<IService[]>(services));
        } catch (error) {
            next(error);
        }
    }

    public getServiceById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const service = await this.serviceService.getServiceById(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<IService>(service));
        } catch (error) {
            next(error);
        }
    }

    public updateService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const service = await this.serviceService.updateService(req.params.id, req.body);
            res.status(HttpStatus.Success).json(formatResponse<IService>(service));
        } catch (error) {
            next(error);
        }
    }

    public deleteService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.serviceService.deleteService(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    }

}
