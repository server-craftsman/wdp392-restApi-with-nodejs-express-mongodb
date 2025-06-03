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
import { AppointmentStatusEnum, PaymentStatusEnum } from '../appointment/appointment.enum';
import { AppointmentLogService } from '../appointment_log';
import { AppointmentLogTypeEnum } from '../appointment_log/appointment_log.enum';
import ReportGeneratorService from './services/reportGenerator.service';

export default class ResultService {
    private resultRepository = new ResultRepository();
    private sampleService = new SampleService();
    private appointmentService = new AppointmentService();
    private appointmentLogService = new AppointmentLogService();
    private reportGeneratorService = new ReportGeneratorService();

    /**
     * Create a new test result
     */
    public async createResult(resultData: CreateResultDto, laboratoryTechnicianId: string): Promise<IResult> {
        try {
            // Validate IDs
            if (!resultData.sample_ids || resultData.sample_ids.length === 0) {
                throw new HttpException(HttpStatus.BadRequest, 'At least one sample ID is required');
            }

            // Validate all sample IDs
            for (const sampleId of resultData.sample_ids) {
                if (!mongoose.Types.ObjectId.isValid(sampleId)) {
                    throw new HttpException(HttpStatus.BadRequest, `Invalid sample ID format: ${sampleId}`);
                }
            }

            if (!mongoose.Types.ObjectId.isValid(resultData.appointment_id) ||
                !mongoose.Types.ObjectId.isValid(resultData.customer_id)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid ID format');
            }

            // Check if all samples exist
            for (const sampleId of resultData.sample_ids) {
                const sample = await this.sampleService.getSampleById(sampleId);
                if (!sample) {
                    throw new HttpException(HttpStatus.NotFound, `Sample not found: ${sampleId}`);
                }

                // Check if sample is not in TESTING status
                if (sample.status !== SampleStatusEnum.TESTING) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        `Cannot create result for sample ${sampleId} that is already in testing status`
                    );
                }

                // Check if result already exists for this sample
                const existingResult = await this.resultRepository.findOne({
                    sample_ids: { $in: [sampleId] }
                });

                if (existingResult) {
                    throw new HttpException(
                        HttpStatus.Conflict,
                        `A result already exists for sample ${sampleId}`
                    );
                }
            }

            // Check if appointment exists
            let appointmentId = resultData.appointment_id;

            // Handle potential ObjectId conversion issues
            try {
                appointmentId = new mongoose.Types.ObjectId(resultData.appointment_id).toString();
            } catch (error) {
                console.error('Error converting appointment ID:', error);
            }

            const appointment = await this.appointmentService.getAppointmentById(appointmentId);
            if (!appointment) {
                throw new HttpException(HttpStatus.NotFound, 'Appointment not found');
            }

            // Check if appointment has been paid for
            if (appointment.payment_status !== PaymentStatusEnum.PAID) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot create result for appointment that hasn't been paid for (payment status: ${appointment.payment_status})`
                );
            }

            // Check if appointment is in TESTING status
            if (appointment.status !== AppointmentStatusEnum.TESTING) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot create result for appointment that is not in testing status`
                );
            }

            // Create the initial result
            const result = await this.resultRepository.create({
                sample_ids: resultData.sample_ids.map(id => id as any),
                appointment_id: resultData.appointment_id as any,
                customer_id: resultData.customer_id as any,
                laboratory_technician_id: laboratoryTechnicianId as any,
                is_match: resultData.is_match,
                result_data: resultData.result_data,
                report_url: '',
                completed_at: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            });

            // Generate PDF report synchronously to ensure report_url is available
            try {
                console.log('Generating PDF report...');
                const reportUrl = await this.reportGeneratorService.generateReport(
                    result._id.toString(),
                    laboratoryTechnicianId
                );

                // Update the result with the report URL
                await this.resultRepository.findByIdAndUpdate(
                    result._id.toString(),
                    { report_url: reportUrl },
                    { new: true }
                );

                // Update the result object to return to the client
                result.report_url = reportUrl;
                console.log(`PDF report generated successfully: ${reportUrl}`);
            } catch (error: any) {
                console.error('Failed to generate PDF report:', error);

                // If the error is related to AWS configuration, provide a clear message
                if (error.message && (
                    error.message.includes('AWS credentials not configured') ||
                    error.message.includes('AWS S3 bucket not configured')
                )) {
                    throw new HttpException(
                        HttpStatus.InternalServerError,
                        'AWS S3 is not properly configured. Please check your AWS credentials and bucket settings.'
                    );
                }

                // For other errors, continue with the process but report the error
                throw new HttpException(
                    HttpStatus.InternalServerError,
                    `Failed to generate PDF report: ${error.message}`
                );
            }

            // Update all samples status to COMPLETED
            for (const sampleId of resultData.sample_ids) {
                await this.sampleService.updateSampleStatus(sampleId, SampleStatusEnum.COMPLETED);
            }

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
     * Generate PDF report for a test result
     * This is called automatically after result creation
     */
    private async generateResultReport(resultId: string, laboratoryTechnicianId: string): Promise<void> {
        try {
            // Generate the PDF report and get the URL
            const reportUrl = await this.reportGeneratorService.generateReport(resultId, laboratoryTechnicianId);

            // Update the result with the report URL
            await this.resultRepository.findByIdAndUpdate(
                resultId,
                { report_url: reportUrl },
                { new: true }
            );

            console.log(`PDF report generated successfully for result ${resultId}: ${reportUrl}`);
        } catch (error) {
            console.error(`Failed to generate PDF report for result ${resultId}:`, error);
            // We don't throw here as this is run asynchronously after the main transaction
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

            // If critical data changed (is_match or result_data), regenerate the PDF report
            if (updateData.is_match !== undefined || updateData.result_data) {
                // Generate PDF report asynchronously
                this.generateResultReport(resultId, laboratoryTechnicianId)
                    .catch(error => {
                        console.error('Failed to regenerate PDF report:', error);
                    });
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

        const result = await this.resultRepository.findById(id);
        if (!result) {
            throw new HttpException(HttpStatus.NotFound, 'Result not found');
        }

        return result;
    }

    /**
     * Get result by sample ID
     */
    public async getResultBySampleId(sampleId: string): Promise<IResult> {
        try {
            if (!mongoose.Types.ObjectId.isValid(sampleId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid sample ID');
            }

            const result = await this.resultRepository.findOne({ sample_ids: { $in: [sampleId] } });

            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Result not found for this sample');
            }

            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error retrieving result');
        }
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

            // Extract appointment ID as string
            let appointmentId: string;
            if (typeof sample.appointment_id === 'object' && sample.appointment_id !== null) {
                appointmentId = sample.appointment_id.toString();
            } else {
                appointmentId = String(sample.appointment_id);
            }

            // Check if appointment exists and has been paid for
            const appointment = await this.appointmentService.getAppointmentById(appointmentId);
            if (!appointment) {
                throw new HttpException(HttpStatus.NotFound, `Appointment not found with ID: ${appointmentId}`);
            }

            if (appointment.payment_status !== PaymentStatusEnum.PAID) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot start testing for appointment that hasn't been paid for (payment status: ${appointment.payment_status})`
                );
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

            // Get appointment ID as string for updating
            const appointmentObjectId = appointment._id.toString();

            // Update appointment status to TESTING
            if (appointment.status !== AppointmentStatusEnum.TESTING) {
                await this.appointmentService.updateAppointmentStatus(
                    appointmentObjectId,
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
            console.error('Error in startTesting:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error starting testing process');
        }
    }
} 