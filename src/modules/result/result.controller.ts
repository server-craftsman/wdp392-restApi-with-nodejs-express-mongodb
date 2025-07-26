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

            // Validate that sample_ids is provided and is an array
            if (!req.body.sample_ids || !Array.isArray(req.body.sample_ids) || req.body.sample_ids.length === 0) {
                throw new HttpException(HttpStatus.BadRequest, 'At least one sample ID is required');
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
                result.customer_id?.toString() !== req.user.id) {
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
                result.customer_id?.toString() !== req.user.id) {
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
            // if (req.user.role === UserRoleEnum.CUSTOMER) {
            //     if (result.customer_id !== req.user.id) {
            //         throw new HttpException(HttpStatus.Forbidden, 'You do not have access to this result');
            //     }
            // }

            // if (req.user.role === UserRoleEnum.CUSTOMER) {
            //     // Handles both populated and unpopulated customer_id
            //     const resultCustomerId = typeof result.customer_id === 'object' && result.customer_id !== null
            //         ? (result.customer_id as any)._id?.toString?.() || (result.customer_id as any).toString?.()
            //         : result.customer_id?.toString?.();

            //     if (resultCustomerId !== req.user.id?.toString()) {
            //         throw new HttpException(HttpStatus.Forbidden, 'You do not have access to this result');
            //     }
            // }

            res.status(HttpStatus.Success).json(formatResponse<IResult>(result));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Start testing process for a sample or multiple samples (by laboratory technician)
     */
    public startTesting = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const laboratoryTechnicianId = req.user.id;
            const userRole = req.user.role;
            const sampleId = req.params.sampleId;

            console.log(`Starting testing process by user ${laboratoryTechnicianId} with role ${userRole}`);

            if (!laboratoryTechnicianId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            // Only laboratory technicians can start testing
            if (userRole !== UserRoleEnum.LABORATORY_TECHNICIAN) {
                throw new HttpException(HttpStatus.Forbidden, 'Only laboratory technicians can start testing');
            }

            const testingData: StartTestingDto = req.body;
            console.log('Testing data:', testingData);

            // If sample_ids are provided in the body, use them for batch processing
            if (testingData.sample_ids && testingData.sample_ids.length > 0) {
                console.log(`Batch processing ${testingData.sample_ids.length} samples`);

                // Process each sample ID
                const results = await Promise.all(
                    testingData.sample_ids.map(async (id) => {
                        try {
                            await this.resultService.startTesting(id, testingData, laboratoryTechnicianId);
                            return { id, success: true };
                        } catch (error: any) {
                            console.error(`Error processing sample ${id}:`, error);
                            return {
                                id,
                                success: false,
                                error: error instanceof HttpException ?
                                    error.message :
                                    'Failed to start testing for this sample'
                            };
                        }
                    })
                );

                // Count successes and failures
                const successful = results.filter(r => r.success).length;
                const failed = results.filter(r => !r.success).length;

                res.status(HttpStatus.Success).json(formatResponse({
                    message: `Testing process started for ${successful} samples, ${failed} failed`,
                    results
                }));
            } else if (sampleId) {
                // Single sample processing using the sample ID from the URL parameter
                await this.resultService.startTesting(sampleId, testingData, laboratoryTechnicianId);
                res.status(HttpStatus.Success).json(formatResponse({
                    message: 'Testing process started successfully',
                    sample_id: sampleId
                }));
            } else {
                // Neither sample_ids in body nor sampleId in URL parameters
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'No sample ID provided. Please provide a sample ID in the URL or sample_ids in the request body.'
                );
            }
        } catch (error) {
            console.error('Error in startTesting controller:', error);
            next(error);
        }
    };

    /**
     * Request physical certificate for legal result
     * @route POST /results/:resultId/request-certificate
     */
    public requestCertificate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            const { resultId } = req.params;
            const { reason, delivery_address } = req.body;

            if (!reason) {
                throw new HttpException(HttpStatus.BadRequest, 'Reason is required');
            }

            const certificateRequest = await this.resultService.requestCertificate(
                resultId,
                userId,
                reason,
                delivery_address
            );

            res.status(HttpStatus.Created).json(formatResponse(certificateRequest, true, 'Certificate request submitted successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get certificate requests for a result
     * @route GET /results/:resultId/certificate-requests
     */
    public getCertificateRequests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            const userRole = req.user?.role;
            if (!userId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            const { resultId } = req.params;

            const requests = await this.resultService.getCertificateRequests(resultId, userId, userRole);

            res.status(HttpStatus.Success).json(formatResponse(requests, true, 'Certificate requests retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update certificate request status (Staff/Admin only)
     * @route PUT /results/certificate-requests/:requestId/status
     */
    public updateCertificateRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const staffId = req.user?.id;
            const userRole = req.user?.role;
            if (!staffId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }

            if (userRole !== UserRoleEnum.STAFF && userRole !== UserRoleEnum.ADMIN) {
                throw new HttpException(HttpStatus.Forbidden, 'Only staff and admin can update certificate requests');
            }

            const { requestId } = req.params;
            const { status, agency_notes } = req.body;

            const updatedRequest = await this.resultService.updateCertificateRequestStatus(
                requestId,
                status,
                agency_notes,
                staffId
            );

            res.status(HttpStatus.Success).json(formatResponse(updatedRequest, true, 'Certificate request status updated successfully'));
        } catch (error) {
            next(error);
        }
    };
} 