import mongoose from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IResult } from './result.interface';
import ResultRepository from './result.repository';
import { CreateResultDto } from './dtos/createResult.dto';
import { UpdateResultDto } from './dtos/updateResult.dto';
import { StartTestingDto } from './dtos/startTesting.dto';
import SampleService from '../sample/sample.service';
import { SampleStatusEnum } from '../sample/sample.enum';
import AppointmentService from '../appointment/appointment.service';
import { AppointmentStatusEnum } from '../appointment/appointment.enum';
import { AppointmentLogService } from '../appointment_log';
import { AppointmentLogTypeEnum } from '../appointment_log/appointment_log.enum';

export default class ResultService {
    private resultRepository = new ResultRepository();
    private sampleService = new SampleService();
    private appointmentService = new AppointmentService();
    private appointmentLogService = new AppointmentLogService();

    /**
     * Create a new test result
     */
    public async createResult(resultData: CreateResultDto, laboratoryTechnicianId: string): Promise<IResult> {
        try {
            // Validate IDs
            if (!mongoose.Types.ObjectId.isValid(resultData.sample_id) ||
                !mongoose.Types.ObjectId.isValid(resultData.appointment_id) ||
                !mongoose.Types.ObjectId.isValid(resultData.customer_id)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid ID format');
            }

            // Check if sample exists
            const sample = await this.sampleService.getSampleById(resultData.sample_id);
            if (!sample) {
                throw new HttpException(HttpStatus.NotFound, 'Sample not found');
            }

            // Check if appointment exists
            const appointment = await this.appointmentService.getAppointmentById(resultData.appointment_id);
            if (!appointment) {
                throw new HttpException(HttpStatus.NotFound, 'Appointment not found');
            }

            // Check if sample is in TESTING status
            if (sample.status !== SampleStatusEnum.TESTING) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot create result for sample with status ${sample.status}`
                );
            }

            // Check if appointment is in TESTING status
            if (appointment.status !== AppointmentStatusEnum.TESTING) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot create result for appointment with status ${appointment.status}`
                );
            }

            // Check if result already exists for this sample
            const existingResult = await this.resultRepository.findOne({
                sample_id: resultData.sample_id
            });

            if (existingResult) {
                throw new HttpException(
                    HttpStatus.Conflict,
                    'A result already exists for this sample'
                );
            }

            // Create the result
            const result = await this.resultRepository.create({
                sample_id: resultData.sample_id as any,
                appointment_id: resultData.appointment_id as any,
                customer_id: resultData.customer_id as any,
                is_match: resultData.is_match,
                result_data: resultData.result_data,
                report_url: resultData.report_url,
                completed_at: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            });

            // Update sample status to COMPLETED
            await this.sampleService.updateSampleStatus(resultData.sample_id, SampleStatusEnum.COMPLETED);

            // Update appointment status to COMPLETED
            await this.appointmentService.updateAppointmentStatus(
                resultData.appointment_id,
                AppointmentStatusEnum.COMPLETED
            );

            // Log the status change
            try {
                await this.appointmentLogService.logStatusChange(
                    appointment,
                    AppointmentLogTypeEnum.COMPLETED
                );
            } catch (logError) {
                console.error('Failed to create appointment log for result creation:', logError);
            }

            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating result');
        }
    }

    /**
     * Update an existing test result
     */
    public async updateResult(resultId: string, updateData: UpdateResultDto, laboratoryTechnicianId: string): Promise<IResult> {
        try {
            // Validate resultId
            if (!mongoose.Types.ObjectId.isValid(resultId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid result ID');
            }

            // Check if result exists
            const result = await this.resultRepository.findById(resultId);
            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Result not found');
            }

            // Update the result
            const updatedResult = await this.resultRepository.findByIdAndUpdate(
                resultId,
                {
                    ...updateData,
                    updated_at: new Date()
                },
                { new: true }
            );

            if (!updatedResult) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to update result');
            }

            return updatedResult;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error updating result');
        }
    }

    /**
     * Get result by ID
     */
    public async getResultById(id: string): Promise<IResult> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid result ID');
        }

        const result = await this.resultRepository.findByIdWithPopulate(id);
        if (!result) {
            throw new HttpException(HttpStatus.NotFound, 'Result not found');
        }

        return result;
    }

    /**
     * Get result by sample ID
     */
    public async getResultBySampleId(sampleId: string): Promise<IResult> {
        if (!mongoose.Types.ObjectId.isValid(sampleId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid sample ID');
        }

        const result = await this.resultRepository.findBySampleId(sampleId);
        if (!result) {
            throw new HttpException(HttpStatus.NotFound, 'Result not found for this sample');
        }

        return result;
    }

    /**
     * Get result by appointment ID
     */
    public async getResultByAppointmentId(appointmentId: string): Promise<IResult> {
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID');
        }

        const result = await this.resultRepository.findByAppointmentId(appointmentId);
        if (!result) {
            throw new HttpException(HttpStatus.NotFound, 'Result not found for this appointment');
        }

        return result;
    }

    /**
     * Start testing process for a sample
     */
    public async startTesting(sampleId: string, testingData: StartTestingDto, laboratoryTechnicianId: string): Promise<void> {
        try {
            // Validate sampleId
            if (!mongoose.Types.ObjectId.isValid(sampleId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid sample ID');
            }

            // Check if sample exists
            const sample = await this.sampleService.getSampleById(sampleId);
            if (!sample) {
                throw new HttpException(HttpStatus.NotFound, 'Sample not found');
            }

            // Check if sample is in RECEIVED status
            if (sample.status !== SampleStatusEnum.RECEIVED) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot start testing for sample with status ${sample.status}`
                );
            }

            // Update sample status to TESTING
            await this.sampleService.updateSampleStatus(sampleId, SampleStatusEnum.TESTING);

            // Get appointment and update its status to TESTING
            const appointment = await this.appointmentService.getAppointmentById(sample.appointment_id.toString());
            if (appointment.status !== AppointmentStatusEnum.TESTING) {
                await this.appointmentService.updateAppointmentStatus(
                    appointment._id.toString(),
                    AppointmentStatusEnum.TESTING
                );

                // Log the status change
                try {
                    await this.appointmentLogService.logStatusChange(
                        appointment,
                        AppointmentLogTypeEnum.TESTING
                    );
                } catch (logError) {
                    console.error('Failed to create appointment log for testing start:', logError);
                }
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error starting testing process');
        }
    }
} 