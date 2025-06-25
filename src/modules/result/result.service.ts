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
import { sendMail, createNotificationEmailTemplate } from '../../core/utils';
import { ISendMailDetail } from '../../core/interfaces';
import UserSchema from '../user/user.model';
import ServiceSchema from '../service/service.model';
import AppointmentSchema from '../appointment/appointment.model';
import { ServiceTypeEnum } from '../service/service.enum';

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

            if (!mongoose.Types.ObjectId.isValid(resultData.appointment_id)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID format');
            }

            // Check if all samples exist
            for (const sampleId of resultData.sample_ids) {
                const sample = await this.sampleService.getSampleById(sampleId);
                if (!sample) {
                    throw new HttpException(HttpStatus.NotFound, `Sample not found: ${sampleId}`);
                }

                // Check if sample is in TESTING status
                if (sample.status !== SampleStatusEnum.TESTING) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        `Cannot create result for sample ${sampleId} that is not in testing status`
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
                throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID format');
            }

            const appointment = await this.appointmentService.getAppointmentById(appointmentId);
            if (!appointment) {
                throw new HttpException(HttpStatus.NotFound, 'Appointment not found');
            }

            // Lấy service để kiểm tra loại
            const service = await ServiceSchema.findById(appointment.service_id);
            let reportTemplate = 'default_report_template';
            let recipientEmail = undefined;
            if (service && service.type === ServiceTypeEnum.ADMINISTRATIVE) {
                reportTemplate = 'administrative_report_template';
                // Ưu tiên lấy email agency từ appointment, nếu không có thì lấy từ user
                recipientEmail = appointment.agency_contact_email;
                if (!recipientEmail) {
                    const user = await AppointmentSchema.findById(appointment.user_id);
                    recipientEmail = user?.email;
                }
            }

            let customerId: string;
            if (resultData.customer_id) {
                if (!mongoose.Types.ObjectId.isValid(resultData.customer_id)) {
                    throw new HttpException(HttpStatus.BadRequest, 'Invalid customer ID format');
                }
                customerId = resultData.customer_id;
                console.log(`Using provided customer_id: ${customerId}`);
            } else if (appointment.user_id) {
                // Handle different possible types of user_id
                if (typeof appointment.user_id === 'string') {
                    // If it's a string, use it directly
                    customerId = appointment.user_id;
                } else if (typeof appointment.user_id === 'object') {
                    // If it's an object (including ObjectId), convert to string
                    try {
                        // Try accessing properties safely with type assertions
                        const userIdObj = appointment.user_id as any;
                        if (userIdObj && userIdObj._id) {
                            customerId = userIdObj._id.toString();
                        } else {
                            // Direct ObjectId or similar
                            customerId = appointment.user_id || '';
                        }
                    } catch (err) {
                        console.error('Error extracting user_id:', err);
                        console.error('appointment.user_id:', appointment.user_id);
                        throw new HttpException(
                            HttpStatus.BadRequest,
                            'Invalid user ID format in appointment'
                        );
                    }
                } else {
                    console.error('Invalid user_id format in appointment:', appointment.user_id);
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        'Invalid user ID format in appointment'
                    );
                }

                // Validate that we have a valid MongoDB ID
                if (!mongoose.Types.ObjectId.isValid(customerId)) {
                    console.error(`Invalid user_id extracted from appointment: ${customerId}`);
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        'Invalid user ID format extracted from appointment'
                    );
                }

                console.log(`Using user_id from appointment: ${customerId}`);
            } else {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'Customer ID not found in appointment'
                );
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

            try {
                // Log all IDs for debugging
                console.log('Creating result with:');
                console.log('sample_ids:', resultData.sample_ids);
                console.log('appointment_id:', appointmentId);
                console.log('customer_id:', customerId);
                console.log('laboratory_technician_id:', laboratoryTechnicianId);

                // Validate all IDs one more time
                if (!mongoose.Types.ObjectId.isValid(customerId)) {
                    throw new Error(`Invalid customer_id format: ${customerId}`);
                }

                if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
                    throw new Error(`Invalid appointment_id format: ${appointmentId}`);
                }

                if (!mongoose.Types.ObjectId.isValid(laboratoryTechnicianId)) {
                    throw new Error(`Invalid laboratory_technician_id format: ${laboratoryTechnicianId}`);
                }

                for (const sampleId of resultData.sample_ids) {
                    if (!mongoose.Types.ObjectId.isValid(sampleId)) {
                        throw new Error(`Invalid sample_id format: ${sampleId}`);
                    }
                }

                // Create the initial result
                const result = await this.resultRepository.create({
                    sample_ids: resultData.sample_ids.map(id => new mongoose.Types.ObjectId(id)) as any,
                    appointment_id: new mongoose.Types.ObjectId(appointmentId) as any,
                    customer_id: new mongoose.Types.ObjectId(customerId) as any,
                    laboratory_technician_id: new mongoose.Types.ObjectId(laboratoryTechnicianId) as any,
                    is_match: resultData.is_match,
                    result_data: resultData.result_data || {},
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
                        laboratoryTechnicianId,
                        reportTemplate
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
                    appointmentId,
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

                // Send result notification email
                try {
                    await this.sendResultReadyEmail(result, appointment, recipientEmail);
                } catch (emailError) {
                    console.error('Failed to send result ready email:', emailError);
                }

                return result;
            } catch (createError: any) {
                console.error('Error creating result document:', createError);
                throw new HttpException(
                    HttpStatus.InternalServerError,
                    `Failed to create result: ${createError.message}`
                );
            }
        } catch (error: any) {
            console.error('Error in createResult:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                HttpStatus.InternalServerError,
                `Error creating result: ${error.message}`
            );
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

                // Send result updated email
                try {
                    if (updatedResult.appointment_id) {
                        const appointment = await this.appointmentService.getAppointmentById(updatedResult.appointment_id.toString());
                        await this.sendResultUpdatedEmail(updatedResult, appointment);
                    } else {
                        console.error('Cannot send result updated email: appointment_id is undefined');
                    }
                } catch (emailError) {
                    console.error('Failed to send result updated email:', emailError);
                }
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
                appointmentId = sample.appointment_id || '';
            } else {
                appointmentId = String(sample.appointment_id) || '';
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

                // Send testing started email
                try {
                    await this.sendTestingStartedEmail(sample, appointment);
                } catch (emailError) {
                    console.error('Failed to send testing started email:', emailError);
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

    /**
     * Send email notification when test result is ready
     */
    private async sendResultReadyEmail(result: IResult, appointment: any, recipientEmail?: string): Promise<void> {
        try {
            // Get user details
            let userId = result.customer_id;
            if (!userId && appointment && appointment.user_id) {
                userId = appointment.user_id;
            }

            if (!userId) {
                console.error('Cannot send email: User ID not found');
                return;
            }

            const user = await UserSchema.findById(userId);
            if (!user || !user.email) {
                console.error('Cannot send email: User not found or no email address');
                return;
            }

            // Get service details if available
            let serviceName = 'DNA Testing Service';
            if (appointment && appointment.service_id) {
                try {
                    const service = await mongoose.model('Service').findById(appointment.service_id);
                    if (service && service.name) {
                        serviceName = service.name;
                    }
                } catch (error) {
                    console.error('Error fetching service details:', error);
                }
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

            const title = 'Your Test Results Are Ready';
            const message = `
                Your test results for ${serviceName} are now ready.
                <br><br>
                <strong>Result Details:</strong>
                <br>
                Result ID: ${result._id}
                <br>
                Date Completed: ${result.completed_at ? new Date(result.completed_at).toLocaleString() : new Date().toLocaleString()}
                <br><br>
                ${result.is_match !== undefined ? `<strong>Result Match:</strong> ${result.is_match ? 'Positive' : 'Negative'}<br><br>` : ''}
                You can view your detailed results by logging into your account and accessing the Results section.
                ${result.report_url ? `<br><br>A detailed report has been generated and is available for viewing.` : ''}
                <br><br>
                If you have any questions about your results, please contact our medical team for assistance.
            `;

            const emailDetails: ISendMailDetail = {
                toMail: recipientEmail || user.email,
                subject: 'Test Results Ready - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Result ready email sent to ${recipientEmail || user.email}`);
        } catch (error) {
            console.error('Error sending result ready email:', error);
        }
    }

    /**
     * Send email notification when test result is updated
     */
    private async sendResultUpdatedEmail(result: IResult, appointment: any): Promise<void> {
        try {
            // Get user details
            let userId = result.customer_id;
            if (!userId && appointment && appointment.user_id) {
                userId = appointment.user_id;
            }

            if (!userId) {
                console.error('Cannot send email: User ID not found');
                return;
            }

            const user = await UserSchema.findById(userId);
            if (!user || !user.email) {
                console.error('Cannot send email: User not found or no email address');
                return;
            }

            // Get service details if available
            let serviceName = 'DNA Testing Service';
            if (appointment && appointment.service_id) {
                try {
                    const service = await mongoose.model('Service').findById(appointment.service_id);
                    if (service && service.name) {
                        serviceName = service.name;
                    }
                } catch (error) {
                    console.error('Error fetching service details:', error);
                }
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

            const title = 'Your Test Results Have Been Updated';
            const message = `
                Your test results for ${serviceName} have been updated.
                <br><br>
                <strong>Result Details:</strong>
                <br>
                Result ID: ${result._id}
                <br>
                Last Updated: ${result.updated_at ? new Date(result.updated_at).toLocaleString() : new Date().toLocaleString()}
                <br><br>
                ${result.is_match !== undefined ? `<strong>Result Match:</strong> ${result.is_match ? 'Positive' : 'Negative'}<br><br>` : ''}
                Please log into your account to view the updated results.
                ${result.report_url ? `<br><br>An updated report has been generated and is available for viewing.` : ''}
                <br><br>
                If you have any questions about these changes, please contact our medical team for assistance.
            `;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: 'Test Results Updated - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Result updated email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending result updated email:', error);
        }
    }

    /**
     * Send email notification when testing process starts
     */
    private async sendTestingStartedEmail(sample: any, appointment: any): Promise<void> {
        try {
            // Get user details from appointment
            const userId = appointment.user_id;
            if (!userId) {
                console.error('Cannot send email: User ID not found in appointment');
                return;
            }

            const user = await UserSchema.findById(userId);
            if (!user || !user.email) {
                console.error('Cannot send email: User not found or no email address');
                return;
            }

            // Get service details if available
            let serviceName = 'DNA Testing Service';
            if (appointment && appointment.service_id) {
                try {
                    const service = await mongoose.model('Service').findById(appointment.service_id);
                    if (service && service.name) {
                        serviceName = service.name;
                    }
                } catch (error) {
                    console.error('Error fetching service details:', error);
                }
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

            const title = 'Sample Testing Started';
            const message = `
                We are pleased to inform you that the laboratory has started processing your sample for ${serviceName}.
                <br><br>
                <strong>Testing Details:</strong>
                <br>
                Sample ID: ${sample._id}
                <br>
                Sample Type: ${sample.sample_type || 'DNA Sample'}
                <br>
                Testing Started: ${new Date().toLocaleString()}
                <br><br>
                The testing process typically takes 3-5 business days to complete. We will notify you as soon as your results are ready.
                <br><br>
                If you have any questions during this process, please don't hesitate to contact our customer support team.
            `;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: 'Sample Testing Started - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Testing started email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending testing started email:', error);
        }
    }
} 