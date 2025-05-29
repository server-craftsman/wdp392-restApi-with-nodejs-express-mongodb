import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import { ISample } from './sample.interface';
import SampleService from './sample.service';
import { SubmitSampleDto } from './dtos/submitSample.dto';
import { ReceiveSampleDto } from './dtos/receiveSample.dto';
import { UserRoleEnum } from '../user/user.enum';
import { AddSampleDto } from './dtos/addSample.dto';

export default class SampleController {
    private sampleService = new SampleService();

    /**
     * Submit a sample (by customer)
     */
    public submitSample = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            const sampleId = req.params.id;
            const submitData: SubmitSampleDto = req.body;

            const updatedSample = await this.sampleService.submitSample(
                sampleId,
                submitData.collection_date ?? new Date().toISOString(),
                userId
            );

            res.status(HttpStatus.Success).json(formatResponse<ISample>(updatedSample));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Receive a sample (by staff)
     */
    public receiveSample = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const staffId = req.user.id;
            const userRole = req.user.role;

            if (!staffId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Only staff can receive samples
            if (userRole !== UserRoleEnum.STAFF) {
                throw new HttpException(HttpStatus.Forbidden, 'Only staff can receive samples');
            }

            const sampleId = req.params.id;
            const receiveData: ReceiveSampleDto = req.body;

            const updatedSample = await this.sampleService.receiveSample(
                sampleId,
                receiveData.received_date,
                staffId
            );

            res.status(HttpStatus.Success).json(formatResponse<ISample>(updatedSample));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get sample by ID
     */
    public getSampleById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sampleId = req.params.id;
            const sample = await this.sampleService.getSampleById(sampleId);

            res.status(HttpStatus.Success).json(formatResponse<ISample>(sample));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get samples by appointment ID
     */
    public getSamplesByAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const appointmentId = req.params.appointmentId;
            const samples = await this.sampleService.getSamplesByAppointmentId(appointmentId);

            res.status(HttpStatus.Success).json(formatResponse<ISample[]>(samples));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Add a sample to an existing appointment
     * @param req Request
     * @param res Response
     */
    public addSampleToAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            console.log('User from request:', req.user);
            console.log('User ID from request:', userId);

            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            const addSampleData: AddSampleDto = req.body;
            const sample = await this.sampleService.addSampleToAppointment(userId, addSampleData);

            res.status(HttpStatus.Created).json(formatResponse<ISample>(sample));
        } catch (error) {
            next(error);
        }
    }
} 