import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import ServiceService from './service.service';
import CreateServiceDto from './dtos/createService.dto';
import { IService } from './service.interface';
import { SearchPaginationResponseModel } from '../../core/models/searchPagination.model';

export default class ServiceController {
    private serviceService = new ServiceService();

    public createService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateServiceDto = req.body;
            const file = req.file;
            const service = await this.serviceService.createService(model, file);
            res.status(HttpStatus.Created).json(formatResponse<IService>(service));
        } catch (error) {
            next(error);
        }
    }

    public getServices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const services = await this.serviceService.getServices(req.query);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IService>>(services));
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

    public getServiceBySlug = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const service = await this.serviceService.getServiceBySlug(req.params.slug);
            res.status(HttpStatus.Success).json(formatResponse<IService>(service));
        } catch (error) {
            next(error);
        }
    }

    public getChildServices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const services = await this.serviceService.getChildServices(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<IService[]>(services));
        } catch (error) {
            next(error);
        }
    }

    public updateService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file;
            const service = await this.serviceService.updateService(req.params.id, req.body, file);
            res.status(HttpStatus.Success).json(formatResponse<IService>(service as IService));
        } catch (error) {
            next(error);
        }
    }

    public deleteService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.serviceService.deleteService(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<string>('Delete service successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Lấy danh sách dịch vụ dựa trên thông tin cuộc hẹn
     */
    public getServicesByAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const services = await this.serviceService.getServicesByAppointment(req.query);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IService>>(services));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Đếm số lượng dịch vụ theo loại
     */
    public countServicesByType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const statistics = await this.serviceService.countServicesByType(req.query);
            res.status(HttpStatus.Success).json(formatResponse(statistics));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Thay đổi trạng thái hoạt động của dịch vụ
     */
    public changeServiceStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { is_active } = req.body;

            if (is_active === undefined) {
                res.status(HttpStatus.BadRequest).json(
                    formatResponse<string>('is_active field is required')
                );
                return;
            }

            const service = await this.serviceService.changeServiceStatus(id, is_active);
            res.status(HttpStatus.Success).json(formatResponse<IService>(service));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all services with images
     */
    public getServicesWithImages = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const services = await this.serviceService.getServicesWithImages();
            res.status(HttpStatus.Success).json(formatResponse<IService[]>(services));
        } catch (error) {
            next(error);
        }
    }
}
