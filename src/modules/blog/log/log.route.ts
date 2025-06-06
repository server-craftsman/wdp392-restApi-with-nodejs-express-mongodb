import { Router } from 'express';
import { API_PATH } from '../../../core/constants';
import { IRoute } from '../../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../../core/middleware';
import { UserRoleEnum } from '../../user/user.enum';
import LogController from './log.controller';

export default class LogRoute implements IRoute {
    public path = API_PATH.BLOG_LOGS;
    public router = Router();
    public logController = new LogController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET: domain:/api/blog-logs/:id -> Get log by id
        this.router.get(
            `${this.path}/:id`,
            this.logController.getLogById
        );

        // GET: domain:/api/blog-logs/blog/:blogId -> Get logs by blog id
        this.router.get(
            `${this.path}/blog/:blogId`,
            this.logController.getLogsByBlogId
        );

        // POST: domain:/api/blog-logs/search -> Search logs
        this.router.post(
            `${this.path}/search`,
            this.logController.searchLogs
        );
    }
}
