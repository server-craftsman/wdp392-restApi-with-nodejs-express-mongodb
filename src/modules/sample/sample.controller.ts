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
import { AddSampleWithMultiplePersonInfoDto } from './dtos/addSampleWithMultiplePersonInfo.dto';
import { BatchSubmitSamplesDto } from './dtos/batchSubmitSamples.dto';
import { BatchReceiveSamplesDto } from './dtos/batchReceiveSamples.dto';
import { SearchSamplesDto } from './dtos/searchSamples.dto';
import { uploadFileToS3 } from '../../core/utils';
import { SampleStatusEnum, SampleTypeEnum } from './sample.enum';
import { CollectSampleDto } from './dtos/collect-sample.dto';
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
     * Get samples ready for testing (samples with status RECEIVED)
     * This is used by laboratory technicians to find samples that are ready to be tested
     */
    public getSamplesReadyForTesting = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user.role;

            // Only laboratory technicians can access this endpoint
            if (userRole !== UserRoleEnum.LABORATORY_TECHNICIAN) {
                throw new HttpException(
                    HttpStatus.Forbidden,
                    'Only laboratory technicians can access samples ready for testing'
                );
            }

            // Get pagination parameters from query string
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            const result = await this.sampleService.getSamplesReadyForTesting(page, limit);

            res.status(HttpStatus.Success).json(formatResponse(result));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Search samples by various criteria
     * This allows laboratory technicians to search for samples by different parameters
     */
    public searchSamples = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user.role;

            // Only laboratory technicians and staff can search samples
            if (userRole !== UserRoleEnum.LABORATORY_TECHNICIAN && userRole !== UserRoleEnum.STAFF) {
                throw new HttpException(
                    HttpStatus.Forbidden,
                    'Only laboratory technicians and staff can search samples'
                );
            }

            // Extract and safely convert query parameters
            let status, type, appointmentId, kitCode, personName, startDate, endDate, page, limit;

            try {
                // Handle status parameter
                if (req.query.status) {
                    status = String(req.query.status) as SampleStatusEnum;
                }

                // Handle type parameter
                if (req.query.type) {
                    type = String(req.query.type) as SampleTypeEnum;
                }

                // Handle appointmentId parameter
                if (req.query.appointmentId) {
                    appointmentId = String(req.query.appointmentId);
                }

                // Handle kitCode parameter
                if (req.query.kitCode) {
                    kitCode = String(req.query.kitCode);
                }

                // Handle personName parameter
                if (req.query.personName) {
                    personName = String(req.query.personName);
                }

                // Handle date parameters
                if (req.query.startDate) {
                    startDate = new Date(String(req.query.startDate));
                    if (isNaN(startDate.getTime())) {
                        startDate = undefined;
                    }
                }

                if (req.query.endDate) {
                    endDate = new Date(String(req.query.endDate));
                    if (isNaN(endDate.getTime())) {
                        endDate = undefined;
                    }
                }

                // Handle pagination parameters
                if (req.query.page) {
                    page = parseInt(String(req.query.page));
                    if (isNaN(page) || page < 1) {
                        page = 1;
                    }
                } else {
                    page = 1;
                }

                if (req.query.limit) {
                    limit = parseInt(String(req.query.limit));
                    if (isNaN(limit) || limit < 1) {
                        limit = 10;
                    }
                } else {
                    limit = 10;
                }
            } catch (error) {
                console.error('Error parsing search parameters:', error);
                // Continue with defaults if parsing fails
            }

            // Prepare search options
            const searchOptions = {
                status,
                type,
                appointmentId,
                kitCode,
                personName,
                startDate,
                endDate,
                page,
                limit
            };

            console.log('Search options in controller:', searchOptions);

            // Search samples
            const result = await this.sampleService.searchSamples(searchOptions);

            // Return formatted response
            res.status(HttpStatus.Success).json(formatResponse(result));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get all samples with RECEIVED status for laboratory technicians
     * This endpoint returns all samples ready for testing with pagination
     */
    public getAllSamplesForTesting = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user.role;

            // Only laboratory technicians can access this endpoint
            if (userRole !== UserRoleEnum.LABORATORY_TECHNICIAN) {
                throw new HttpException(
                    HttpStatus.Forbidden,
                    'Only laboratory technicians can access samples for testing'
                );
            }

            // Get pagination parameters from query string
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            const result = await this.sampleService.getSamplesForTesting(page, limit);

            res.status(HttpStatus.Success).json(formatResponse(result));
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

            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Tạo DTO từ request body
            const addSampleData: AddSampleDto = req.body;

            // Nếu không có kit_id, hệ thống sẽ tự động gán kit có sẵn
            const samples = await this.sampleService.addSampleToAppointment(userId, addSampleData);

            res.status(HttpStatus.Created).json(formatResponse<ISample[]>(samples));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add samples with multiple person information
     * Each sample type corresponds to a person_info entry in the person_info_list array
     * @param req Request
     * @param res Response
     */
    public addSamplesWithMultiplePersonInfo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;

            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Create DTO from request body
            const addSampleData: AddSampleWithMultiplePersonInfoDto = req.body;

            // Validate that sample_types and person_info_list have the same length
            if (addSampleData.sample_types.length !== addSampleData.person_info_list.length) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'The number of sample types must match the number of person info entries'
                );
            }

            // Convert to AddSampleDto and set person_info_list
            const convertedData: AddSampleDto = {
                appointment_id: addSampleData.appointment_id,
                kit_id: addSampleData.kit_id,
                sample_types: addSampleData.sample_types,
                notes: addSampleData.notes,
                person_info_list: addSampleData.person_info_list
            };

            // Call the service to add samples
            const samples = await this.sampleService.addSampleToAppointment(userId, convertedData);

            res.status(HttpStatus.Created).json(formatResponse<ISample[]>(samples));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Batch submit multiple samples (by customer)
     * @param req Request
     * @param res Response
     * @param next NextFunction
     */
    public batchSubmitSamples = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            const batchSubmitData: BatchSubmitSamplesDto = req.body;

            const updatedSamples = await this.sampleService.batchSubmitSamples(
                batchSubmitData.sample_ids,
                batchSubmitData.collection_date,
                userId
            );

            res.status(HttpStatus.Success).json(formatResponse<ISample[]>(updatedSamples));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Batch receive multiple samples (by staff)
     * @param req Request
     * @param res Response
     * @param next NextFunction
     */
    public batchReceiveSamples = async (req: Request, res: Response, next: NextFunction) => {
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

            const batchReceiveData: BatchReceiveSamplesDto = req.body;

            const updatedSamples = await this.sampleService.batchReceiveSamples(
                batchReceiveData.sample_ids,
                batchReceiveData.received_date,
                staffId
            );

            res.status(HttpStatus.Success).json(formatResponse<ISample[]>(updatedSamples));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Upload an image for a person in a sample
     * @param req Request
     * @param res Response
     * @param next NextFunction
     */
    public uploadPersonImage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Get the sample ID from the request body or query parameters
            let sample_id = req.body.sample_id;

            // For multipart/form-data, sample_id might be in req.body as a string
            console.log("Request body:", req.body);
            console.log("Request file:", req.file);

            if (!sample_id) {
                throw new HttpException(HttpStatus.BadRequest, 'Sample ID is required');
            }

            // Check if file was uploaded
            if (!req.file) {
                throw new HttpException(HttpStatus.BadRequest, 'No file uploaded');
            }

            // Get the image URL - either from the file location (already uploaded to S3) or upload it
            let imageUrl = (req.file as any).location || req.file.path;

            // If the file path is not a URL (not already uploaded to S3), upload it
            if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
                imageUrl = await uploadFileToS3(req.file, sample_id);
            }

            console.log("File uploaded successfully to:", imageUrl);

            // Update the person's image URL in the sample
            const updatedSample = await this.sampleService.updatePersonImage(
                sample_id,
                imageUrl,
                userId,
                userRole
            );

            res.status(HttpStatus.Success).json(formatResponse({
                sample: updatedSample,
                // image_url: imageUrl
            }));
        } catch (error) {
            console.error("Error in uploadPersonImage controller:", error);
            next(error);
        }
    };

    /**
     * Collect sample at facility
     * @route POST /samples/collect
     */
    public collectSampleAtFacility = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const staffId = req.user?.id;
            if (!staffId) {
                throw new HttpException(HttpStatus.Unauthorized, 'Staff not authenticated');
            }

            const collectSampleData: CollectSampleDto = req.body;

            const result = await this.sampleService.collectSampleAtFacility(
                collectSampleData,
                staffId
            );

            res.status(HttpStatus.Success).json(formatResponse<ISample[]>(result));
        } catch (error) {
            next(error);
        }
    };
} 