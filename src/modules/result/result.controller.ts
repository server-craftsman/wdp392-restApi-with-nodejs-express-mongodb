import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import { IResult } from './result.interface';
import ResultService from './result.service';
import { CreateResultDto } from './dtos/createResult.dto';
import { UpdateResultDto } from './dtos/updateResult.dto';
import { StartTestingDto } from './dtos/startTesting.dto';
import { UserRoleEnum } from '../user/user.enum';

export default class ResultController {
    private resultService = new ResultService();

    /**
     * Create a new test result (by laboratory technician)
     */
    public createResult = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const laboratoryTechnicianId = req.user.id;
            const userRole = req.user.role;

            if (!laboratoryTechnicianId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Only laboratory technicians can create results
            if (userRole !== UserRoleEnum.LABORATORY_TECHNICIAN) {
                throw new HttpException(HttpStatus.Forbidden, 'Only laboratory technicians can create test results');
            }

            const resultData: CreateResultDto = req.body;
            const result = await this.resultService.createResult(resultData, laboratoryTechnicianId);

            res.status(HttpStatus.Created).json(formatResponse<IResult>(result));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update an existing test result (by laboratory technician)
     */
    public updateResult = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const laboratoryTechnicianId = req.user.id;
            const userRole = req.user.role;
            const resultId = req.params.id;

            if (!laboratoryTechnicianId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Only laboratory technicians can update results
            if (userRole !== UserRoleEnum.LABORATORY_TECHNICIAN) {
                throw new HttpException(HttpStatus.Forbidden, 'Only laboratory technicians can update test results');
            }

            const updateData: UpdateResultDto = req.body;
            const updatedResult = await this.resultService.updateResult(resultId, updateData, laboratoryTechnicianId);

            res.status(HttpStatus.Success).json(formatResponse<IResult>(updatedResult));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get result by ID (accessible by customer, staff, laboratory technician, manager, admin)
     */
    public getResultById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const resultId = req.params.id;
            const result = await this.resultService.getResultById(resultId);

            // If user is customer, check if they have access to this result
            if (req.user.role === UserRoleEnum.CUSTOMER &&
                result.customer_id.toString() !== req.user.id) {
                throw new HttpException(HttpStatus.Forbidden, 'You do not have access to this result');
            }

            res.status(HttpStatus.Success).json(formatResponse<IResult>(result));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get result by sample ID (accessible by customer, staff, laboratory technician, manager, admin)
     */
    public getResultBySampleId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sampleId = req.params.sampleId;
            const result = await this.resultService.getResultBySampleId(sampleId);

            // If user is customer, check if they have access to this result
            if (req.user.role === UserRoleEnum.CUSTOMER &&
                result.customer_id.toString() !== req.user.id) {
                throw new HttpException(HttpStatus.Forbidden, 'You do not have access to this result');
            }

            res.status(HttpStatus.Success).json(formatResponse<IResult>(result));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get result by appointment ID (accessible by customer, staff, laboratory technician, manager, admin)
     */
    public getResultByAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const appointmentId = req.params.appointmentId;
            const result = await this.resultService.getResultByAppointmentId(appointmentId);

            // If user is customer, check if they have access to this result
            if (req.user.role === UserRoleEnum.CUSTOMER &&
                result.customer_id.toString() !== req.user.id) {
                throw new HttpException(HttpStatus.Forbidden, 'You do not have access to this result');
            }

            res.status(HttpStatus.Success).json(formatResponse<IResult>(result));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Start testing process for a sample (by laboratory technician)
     */
    public startTesting = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const laboratoryTechnicianId = req.user.id;
            const userRole = req.user.role;
            const sampleId = req.params.sampleId;

            if (!laboratoryTechnicianId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Only laboratory technicians can start testing
            if (userRole !== UserRoleEnum.LABORATORY_TECHNICIAN) {
                throw new HttpException(HttpStatus.Forbidden, 'Only laboratory technicians can start testing');
            }

            const testingData: StartTestingDto = req.body;
            await this.resultService.startTesting(sampleId, testingData, laboratoryTechnicianId);

            res.status(HttpStatus.Success).json(formatResponse({ message: 'Testing process started successfully' }));
        } catch (error) {
            next(error);
        }
    };
} 