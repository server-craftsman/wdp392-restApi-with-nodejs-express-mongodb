import { NextFunction, Request, Response, Router } from 'express';
import { HttpStatus } from '../../../core/enums';
import { SearchPaginationResponseModel } from '../../../core/models';
import { ILog } from './log.interface';
import LogService from './log.service';
import { LogSearchDto } from './dtos/log.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { formatResponse } from '../../../core/utils';

class LogController {
    private logService = new LogService();

    public getLogById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const logId = req.params.id;
            const log: ILog = await this.logService.getLogById(logId);
            res.status(HttpStatus.Success).json(formatResponse<ILog>(log));
        } catch (error) {
            next(error);
        }
    };

    public getLogsByBlogId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const blogId = req.params.blogId;
            const logs: ILog[] = await this.logService.getLogsByBlogId(blogId);
            res.status(HttpStatus.Success).json(formatResponse<ILog[]>(logs));
        } catch (error) {
            next(error);
        }
    };

    public searchLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const searchData = plainToInstance(LogSearchDto, req.body.searchCondition || {});
            await validateOrReject(searchData);

            const pageInfo = req.body.pageInfo || { pageNum: 1, pageSize: 10 };
            const { pageNum, pageSize } = pageInfo;

            const searchResult = await this.logService.searchLogs(searchData, pageNum, pageSize);

            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<ILog>>(searchResult));
        } catch (error) {
            next(error);
        }
    };
}

export default LogController;
