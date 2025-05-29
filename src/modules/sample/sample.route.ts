import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import SampleController from './sample.controller';
import { SubmitSampleDto } from './dtos/submitSample.dto';
import { ReceiveSampleDto } from './dtos/receiveSample.dto';
import { AddSampleDto } from './dtos/addSample.dto';

export default class SampleRoute implements IRoute {
    public path = API_PATH.SAMPLE;
    public router = Router();
    private sampleController = new SampleController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET: domain:/api/sample/:id -> Get sample by ID
        this.router.get(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.CUSTOMER]),
            this.sampleController.getSampleById
        );

        // GET: domain:/api/sample/appointment/:appointmentId -> Get samples by appointment ID
        this.router.get(
            `${this.path}/appointment/:appointmentId`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.CUSTOMER, UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.sampleController.getSamplesByAppointmentId
        );

        // POST: domain:/api/sample/add-to-appointment -> Add sample to appointment
        this.router.post(
            `${this.path}/add-to-appointment`,
            authMiddleWare([UserRoleEnum.CUSTOMER]),
            validationMiddleware(AddSampleDto),
            this.sampleController.addSampleToAppointment
        );

        // PUT: domain:/api/sample/:id/submit -> Submit a sample (customer)
        this.router.put(
            `${this.path}/:id/submit`,
            authMiddleWare([UserRoleEnum.CUSTOMER]),
            validationMiddleware(SubmitSampleDto),
            this.sampleController.submitSample
        );

        // PUT: domain:/api/sample/:id/receive -> Receive a sample (staff)
        this.router.put(
            `${this.path}/:id/receive`,
            authMiddleWare([UserRoleEnum.STAFF]),
            validationMiddleware(ReceiveSampleDto),
            this.sampleController.receiveSample
        );
    }
} 