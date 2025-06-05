import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware, uploadSingleFile } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import SampleController from './sample.controller';
import { SubmitSampleDto } from './dtos/submitSample.dto';
import { ReceiveSampleDto } from './dtos/receiveSample.dto';
import { AddSampleDto } from './dtos/addSample.dto';
import { AddSampleWithMultiplePersonInfoDto } from './dtos/addSampleWithMultiplePersonInfo.dto';
import { BatchSubmitSamplesDto } from './dtos/batchSubmitSamples.dto';
import { BatchReceiveSamplesDto } from './dtos/batchReceiveSamples.dto';
import { UploadPersonImageDto } from './dtos/uploadPersonImage.dto';
import { SearchSamplesDto } from './dtos/searchSamples.dto';
import { CollectSampleDto } from './dtos/collect-sample.dto';

export default class SampleRoute implements IRoute {
    public path = API_PATH.SAMPLE;
    public router = Router();
    private sampleController = new SampleController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET: domain:/api/sample/search -> Search samples by various criteria
        this.router.get(
            `${API_PATH.SAMPLE}/search`,
            authMiddleWare([UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.STAFF]),
            this.sampleController.searchSamples
        );

        // GET: domain:/api/sample/testing/ready -> Get samples ready for testing (RECEIVED status)
        this.router.get(
            `${API_PATH.SAMPLE}/testing/ready`,
            authMiddleWare([UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.sampleController.getSamplesReadyForTesting
        );

        // GET: domain:/api/sample/testing/all -> Get all samples with TESTING status without pagination
        this.router.get(
            `${API_PATH.SAMPLE}/testing/all`,
            authMiddleWare([UserRoleEnum.LABORATORY_TECHNICIAN]),
            this.sampleController.getAllSamplesForTesting
        );

        // GET: domain:/api/sample/appointment/:appointmentId -> Get samples by appointment ID
        this.router.get(
            `${API_PATH.SAMPLE}/appointment/:appointmentId`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.CUSTOMER]),
            this.sampleController.getSamplesByAppointmentId
        );

        // GET: domain:/api/sample/:id -> Get sample by ID
        this.router.get(
            `${API_PATH.SAMPLE}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN, UserRoleEnum.CUSTOMER]),
            this.sampleController.getSampleById
        );

        // PUT: domain:/api/sample/:id/submit -> Submit a sample (by customer)
        this.router.put(
            `${API_PATH.SAMPLE}/:id/submit`,
            authMiddleWare([UserRoleEnum.CUSTOMER]),
            validationMiddleware(SubmitSampleDto),
            this.sampleController.submitSample
        );

        // PUT: domain:/api/sample/:id/receive -> Receive a sample (by staff)
        this.router.put(
            `${API_PATH.SAMPLE}/:id/receive`,
            authMiddleWare([UserRoleEnum.STAFF]),
            validationMiddleware(ReceiveSampleDto),
            this.sampleController.receiveSample
        );

        // POST: domain:/api/sample/add-to-appointment -> Add a sample to an existing appointment
        this.router.post(
            `${API_PATH.SAMPLE}/add-to-appointment`,
            authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.CUSTOMER]),
            validationMiddleware(AddSampleWithMultiplePersonInfoDto),
            this.sampleController.addSamplesWithMultiplePersonInfo
        );

        // POST: domain:/api/sample/add-multiple-person-samples -> Add samples with multiple person information
        // this.router.post(
        //     `${API_PATH.SAMPLE}/add-multiple-person-samples`,
        //     authMiddleWare([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.CUSTOMER]),
        //     validationMiddleware(AddSampleWithMultiplePersonInfoDto),
        //     this.sampleController.addSamplesWithMultiplePersonInfo
        // );

        // POST: domain:/api/sample/batch-submit -> Batch submit multiple samples (by customer)
        this.router.post(
            `${API_PATH.SAMPLE}/batch-submit`,
            authMiddleWare([UserRoleEnum.CUSTOMER]),
            validationMiddleware(BatchSubmitSamplesDto),
            this.sampleController.batchSubmitSamples
        );

        // POST: domain:/api/sample/batch-receive -> Batch receive multiple samples (by staff)
        this.router.post(
            `${API_PATH.SAMPLE}/batch-receive`,
            authMiddleWare([UserRoleEnum.STAFF]),
            validationMiddleware(BatchReceiveSamplesDto),
            this.sampleController.batchReceiveSamples
        );

        // POST: domain:/api/sample/upload-person-image -> Upload person image for a sample
        this.router.post(
            `${API_PATH.SAMPLE}/upload-person-image`,
            authMiddleWare([UserRoleEnum.CUSTOMER, UserRoleEnum.STAFF]),
            uploadSingleFile('image'),
            this.sampleController.uploadPersonImage
        );

        // POST: domain:/api/samples/collect -> Collect sample at facility
        this.router.post(
            `${this.path}/collect`,
            authMiddleWare([UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN]),
            validationMiddleware(CollectSampleDto),
            this.sampleController.collectSampleAtFacility
        );
    }
} 