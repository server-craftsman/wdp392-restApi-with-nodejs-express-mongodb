import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import DashboardController from './dashboard.controller';

export default class DashboardRoute implements IRoute {
    public path = API_PATH.DASHBOARD;
    public router = Router();
    private dashboardController = new DashboardController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET /api/dashboard/summary
        this.router.get(`${this.path}/summary`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.dashboardController.getSummary);

        // GET /api/dashboard/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
        this.router.get(`${this.path}/revenue`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.dashboardController.getRevenue);

        // GET /api/dashboard/payments/status
        this.router.get(`${this.path}/payments/status`, authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]), this.dashboardController.getPaymentStatusCounts);

        // GET /api/dashboard/staff/summary
        this.router.get(`${this.path}/staff/summary`, authMiddleWare([UserRoleEnum.STAFF]), this.dashboardController.getStaffSummary);

        // GET /api/dashboard/lab-tech/summary
        this.router.get(`${this.path}/lab-tech/summary`, authMiddleWare([UserRoleEnum.LABORATORY_TECHNICIAN]), this.dashboardController.getLabTechSummary);
    }
}
