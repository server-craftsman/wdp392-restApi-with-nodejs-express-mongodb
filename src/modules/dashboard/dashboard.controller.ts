import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import DashboardService from './dashboard.service';

export default class DashboardController {
    private dashboardService = new DashboardService();

    public getSummary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.dashboardService.getSummary();
            res.status(HttpStatus.Success).json(
                formatResponse(data, true, 'Dashboard summary fetched successfully')
            );
        } catch (error) {
            next(error);
        }
    };

    public getRevenue = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { from, to } = req.query as { from?: string; to?: string };
            const data = await this.dashboardService.getRevenue(from, to);
            res.status(HttpStatus.Success).json(
                formatResponse(data, true, 'Revenue data fetched successfully')
            );
        } catch (error) {
            next(error);
        }
    };

    public getPaymentStatusCounts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.dashboardService.getPaymentStatusCounts();
            res.status(HttpStatus.Success).json(
                formatResponse(data, true, 'Payment status counts fetched successfully')
            );
        } catch (error) {
            next(error);
        }
    };

    public getStaffSummary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const data = await this.dashboardService.getStaffSummary(userId);
            res.status(HttpStatus.Success).json(
                formatResponse(data, true, 'Staff dashboard summary fetched successfully')
            );
        } catch (error) {
            next(error);
        }
    };

    public getLabTechSummary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const data = await this.dashboardService.getLabTechSummary(userId);
            res.status(HttpStatus.Success).json(
                formatResponse(data, true, 'Laboratory technician dashboard summary fetched successfully')
            );
        } catch (error) {
            next(error);
        }
    };
} 