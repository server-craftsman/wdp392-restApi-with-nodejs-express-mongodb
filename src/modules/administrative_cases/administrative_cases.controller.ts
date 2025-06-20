import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import AdministrativeCasesService from './administrative_cases.service';
import { UserRoleEnum } from '../user/user.enum';

export default class AdministrativeCasesController {
    private administrativeCasesService = new AdministrativeCasesService();

    public createCase = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }
            const data = req.body;
            const applicantId = req.user.id;
            const result = await this.administrativeCasesService.createCase(data, applicantId);
            res.status(HttpStatus.Created).json(formatResponse(result));
        } catch (error) {
            next(error);
        }
    };

    public getCaseById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const result = await this.administrativeCasesService.getCaseById(id);
            res.status(HttpStatus.Success).json(formatResponse(result));
        } catch (error) {
            next(error);
        }
    };

    public updateCase = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }
            const id = req.params.id;
            const data = req.body;
            const result = await this.administrativeCasesService.updateCase(id, data);
            res.status(HttpStatus.Success).json(formatResponse(result));
        } catch (error) {
            next(error);
        }
    };

    public deleteCase = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }
            const id = req.params.id;
            const isDeleted = await this.administrativeCasesService.deleteCase(id);
            if (!isDeleted) {
                throw new HttpException(HttpStatus.NotFound, 'Administrative case not found');
            }
            res.status(HttpStatus.Success).json(formatResponse<string>('Deleted administrative case successfully!'));
        } catch (error) {
            next(error);
        }
    };

    public listCases = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (![UserRoleEnum.ADMIN, UserRoleEnum.MANAGER].includes(req.user.role)) {
                throw new HttpException(HttpStatus.Forbidden, 'Permission denied');
            }
            const result = await this.administrativeCasesService.listCases(req.query);
            res.status(HttpStatus.Success).json(formatResponse(result));
        } catch (error) {
            next(error);
        }
    };
}
