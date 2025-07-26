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
import AppointmentLogService from '../appointment_log/appointment_log.service';
import { AppointmentLogTypeEnum } from '../appointment_log/appointment_log.enum';
import ReportGeneratorService from './services/reportGenerator.service';
import { sendMail, createNotificationEmailTemplate } from '../../core/utils';
import { ISendMailDetail } from '../../core/interfaces';
import UserSchema from '../user/user.model';
import ServiceSchema from '../service/service.model';
import AppointmentSchema from '../appointment/appointment.model';
import { ServiceTypeEnum } from '../service/service.enum';
import CertificateRequestSchema from './certificate-request.model';
import { ICertificateRequest } from './result.interface';
import { UserRoleEnum } from '../user/user.enum';

/**
 * Helper function to extract appointment ID from a sample object that might have populated appointment_id
 * @param sample The sample object
 * @returns The extracted appointment ID as a string
 */
function extractAppointmentIdFromSample(sample: any): string {
    if (!sample || !sample.appointment_id) {
        throw new Error('Appointment ID not found in sample');
    }

    // If appointment_id is an object (populated)
    if (typeof sample.appointment_id === 'object' && sample.appointment_id !== null) {
        const appointmentObj = sample.appointment_id;

        // If populated with _id field
        if (appointmentObj._id) {
            return appointmentObj._id.toString();
        }

        // If it's another type of object, try to convert to string
        return String(sample.appointment_id);
    }

    // If appointment_id is a primitive (string or ObjectId)
    return String(sample.appointment_id);
}

export default class ResultService {
    private resultRepository = new ResultRepository();
    private sampleService?: SampleService;
    private appointmentService?: AppointmentService;
    private appointmentLogService = new AppointmentLogService();
    private reportGeneratorService = new ReportGeneratorService();

    /**
     * Lazy load SampleService to avoid circular dependency
     */
    private getSampleService(): SampleService {
        if (!this.sampleService) {
            this.sampleService = new SampleService();
        }
        return this.sampleService;
    }

    /**
     * Lazy load AppointmentService to avoid circular dependency
     */
    private getAppointmentService(): AppointmentService {
        if (!this.appointmentService) {
            this.appointmentService = new AppointmentService();
        }
        return this.appointmentService;
    }

    /**
     * Convert AppointmentStatusEnum to AppointmentLogTypeEnum
     */
    private convertStatusToLogType(status: any): AppointmentLogTypeEnum {
        // Map appointment status to log type
        const statusMap: Record<string, AppointmentLogTypeEnum> = {
            'pending': AppointmentLogTypeEnum.PENDING,
            'confirmed': AppointmentLogTypeEnum.CONFIRMED,
            'sample_assigned': AppointmentLogTypeEnum.SAMPLE_ASSIGNED,
            'sample_collected': AppointmentLogTypeEnum.SAMPLE_COLLECTED,
            'sample_received': AppointmentLogTypeEnum.SAMPLE_RECEIVED,
            'testing': AppointmentLogTypeEnum.TESTING,
            'completed': AppointmentLogTypeEnum.COMPLETED,
            'cancelled': AppointmentLogTypeEnum.CANCELLED,
            'awaiting_authorization': AppointmentLogTypeEnum.AWAITING_AUTHORIZATION,
            'authorized': AppointmentLogTypeEnum.AUTHORIZED,
            'ready_for_collection': AppointmentLogTypeEnum.READY_FOR_COLLECTION
        };

        return statusMap[status] || AppointmentLogTypeEnum.PENDING;
    }

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
                const sample = await this.getSampleService().getSampleById(sampleId);
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

            const appointment = await this.getAppointmentService().getAppointmentById(appointmentId);
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
            if (appointment.payment_status !== PaymentStatusEnum.PAID && appointment.payment_status !== PaymentStatusEnum.GOVERNMENT_FUNDED) {
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
                    await this.getSampleService().updateSampleStatus(sampleId, SampleStatusEnum.COMPLETED);
                }

                // Update appointment status to COMPLETED
                await this.getAppointmentService().updateAppointmentStatus(
                    appointmentId,
                    AppointmentStatusEnum.COMPLETED
                );

                // Log the status change
                try {
                    await this.appointmentLogService.logStatusChange(
                        appointment,
                        this.convertStatusToLogType(appointment.status),
                        AppointmentLogTypeEnum.COMPLETED,
                        laboratoryTechnicianId
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
                        const appointment = await this.getAppointmentService().getAppointmentById(updatedResult.appointment_id.toString());
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
            const sample = await this.getSampleService().getSampleById(sampleId);
            if (!sample) {
                throw new HttpException(HttpStatus.NotFound, 'Sample not found');
            }

            // Extract appointment ID using the helper function
            const appointmentId = extractAppointmentIdFromSample(sample);
            console.log('Extracted appointment ID:', appointmentId);

            // Check if appointment exists and has been paid for
            const appointment = await this.getAppointmentService().getAppointmentById(appointmentId);
            if (!appointment) {
                throw new HttpException(HttpStatus.NotFound, `Appointment not found with ID: ${appointmentId}`);
            }

            if (appointment.payment_status !== PaymentStatusEnum.PAID && appointment.payment_status !== PaymentStatusEnum.GOVERNMENT_FUNDED) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot start testing for appointment that hasn't been paid for (payment status: ${appointment.payment_status})`
                );
            }

            // Allow starting testing when the sample is either PENDING or RECEIVED.
            // If it's still PENDING, automatically mark it as RECEIVED first.
            if (sample.status === SampleStatusEnum.PENDING) {
                // Automatically move sample to RECEIVED before starting testing
                await this.getSampleService().updateSampleStatus(sampleId, SampleStatusEnum.RECEIVED);
                console.log(`Sample ${sampleId} status changed from PENDING -> RECEIVED automatically before testing.`);
            } else if (sample.status !== SampleStatusEnum.RECEIVED) {
                // For any other status that is not RECEIVED, throw an error
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot start testing for sample with status ${sample.status}`
                );
            }

            // Update sample status to TESTING
            await this.getSampleService().updateSampleStatus(sampleId, SampleStatusEnum.TESTING);

            // Get appointment ID as string for updating
            const appointmentObjectId = appointment._id.toString();

            // Update appointment status to TESTING
            if (appointment.status !== AppointmentStatusEnum.TESTING) {
                await this.getAppointmentService().updateAppointmentStatus(
                    appointmentObjectId,
                    AppointmentStatusEnum.TESTING
                );

                // Log the status change
                try {
                    await this.appointmentLogService.logStatusChange(
                        appointment,
                        this.convertStatusToLogType(appointment.status),
                        AppointmentLogTypeEnum.TESTING,
                        laboratoryTechnicianId
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
        } catch (error: any) {
            console.error('Error in startTesting:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, `Error starting testing process: ${error.message}`);
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
            let serviceName = 'Dịch vụ xét nghiệm ADN';
            let isAdministrative = false;
            if (appointment && appointment.service_id) {
                try {
                    const service = await mongoose.model('Service').findById(appointment.service_id);
                    if (service && service.name) {
                        serviceName = service.name;
                        isAdministrative = service.type === 'administrative';
                    }
                } catch (error) {
                    console.error('Error fetching service details:', error);
                }
            }

            // Get administrative case details if applicable
            let adminCaseInfo = '';
            if (isAdministrative && appointment.administrative_case_id) {
                try {
                    const AdministrativeCasesService = require('../administrative_cases/administrative_cases.service').default;
                    const adminCasesService = new AdministrativeCasesService();
                    const adminCase = await adminCasesService.getAdministrativeCaseById(appointment.administrative_case_id);

                    if (adminCase) {
                        adminCaseInfo = `
                            <br><strong>Thông tin vụ việc hành chính:</strong>
                            <br>Số vụ việc: ${adminCase.case_number}
                            <br>Cơ quan yêu cầu: ${adminCase.requesting_agency}
                            <br>Người liên hệ: ${adminCase.agency_contact_name}
                            <br>
                        `;
                    }
                } catch (error) {
                    console.error('Error fetching administrative case details:', error);
                }
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

            const title = isAdministrative ? 'Kết quả xét nghiệm hành chính đã sẵn sàng' : 'Kết quả xét nghiệm của bạn đã sẵn sàng';

            // Build report URL section
            let reportSection = '';
            if (result.report_url) {
                reportSection = `
                    <br><br>
                    <strong>📄 Báo cáo chi tiết:</strong>
                    <br>
                    <a href="${result.report_url}" target="_blank" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
                        📥 Tải báo cáo PDF
                    </a>
                    <br>
                    <small style="color: #666;">Liên kết báo cáo: <a href="${result.report_url}" target="_blank">${result.report_url}</a></small>
                `;
            }

            const message = `
                ${isAdministrative ? 'Kết quả xét nghiệm hành chính' : 'Kết quả xét nghiệm'} cho dịch vụ ${serviceName} đã sẵn sàng.
                ${adminCaseInfo}
                <br><br>
                <strong>Chi tiết kết quả:</strong>
                <br>
                Mã kết quả: ${result._id}
                <br>
                Ngày hoàn thành: ${result.completed_at ? new Date(result.completed_at).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}
                <br><br>
                ${result.is_match !== undefined ? `<strong>Kết quả khớp:</strong> ${result.is_match ? '✅ Dương tính' : '❌ Âm tính'}<br><br>` : ''}
                ${isAdministrative ?
                    'Cơ quan có thể xem kết quả chi tiết bằng cách truy cập hệ thống hoặc tải báo cáo bên dưới.' :
                    'Bạn có thể xem kết quả chi tiết bằng cách đăng nhập vào tài khoản và truy cập phần Kết quả.'
                }
                ${reportSection}
                <br><br>
                ${isAdministrative ?
                    'Nếu có thắc mắc về kết quả, vui lòng liên hệ với đội ngũ y tế của chúng tôi để được hỗ trợ.' :
                    'Nếu bạn có thắc mắc về kết quả, vui lòng liên hệ với đội ngũ y tế của chúng tôi để được hỗ trợ.'
                }
                <br><br>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <small style="color: #666;">
                    🏥 <strong>Hệ thống xét nghiệm ADN Bloodline</strong><br>
                    📞 Hotline: 1900-XXX-XXX<br>
                    📧 Email: support@bloodline.vn<br>
                    🌐 Website: bloodline.vn
                </small>
            `;

            const emailDetails: ISendMailDetail = {
                toMail: recipientEmail || user.email,
                subject: isAdministrative ?
                    '🔬 Kết quả xét nghiệm hành chính - Hệ thống ADN Bloodline' :
                    '🔬 Kết quả xét nghiệm đã sẵn sàng - Hệ thống ADN Bloodline',
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Result ready email sent to ${recipientEmail || user.email}${isAdministrative ? ' (Administrative)' : ''}`);
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
            const user = await UserSchema.findById(appointment.user_id);
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

            const title = 'Testing Started for Your Sample';
            const message = `
                Testing has started for your sample related to ${serviceName}.
                <br><br>
                <strong>Sample Details:</strong>
                <br>
                Sample ID: ${sample._id}
                <br>
                Sample Type: ${sample.type}
                <br>
                Collection Date: ${sample.collection_date ? new Date(sample.collection_date).toLocaleString() : 'Not specified'}
                <br><br>
                We will notify you as soon as the results are ready.
                <br><br>
                Thank you for choosing our DNA testing services.
            `;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: 'Testing Started - Bloodline DNA Testing Service',
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Testing started email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending testing started email:', error);
        }
    }

    /**
     * Request physical certificate for legal DNA test result
     */
    public async requestCertificate(
        resultId: string,
        customerId: string,
        reason: string,
        deliveryAddress?: string
    ): Promise<ICertificateRequest> {
        try {
            // Validate result exists and belongs to customer
            const result = await this.resultRepository.findById(resultId);
            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Result not found');
            }

            // Verify ownership
            // if (result.customer_id !== customerId) {
            //     throw new HttpException(HttpStatus.Forbidden, 'You are not authorized to request certificate for this result');
            // }

            // Check if result is from administrative service (legal cases)
            const appointment = await AppointmentSchema.findById(result.appointment_id);
            if (!appointment) {
                throw new HttpException(HttpStatus.NotFound, 'Associated appointment not found');
            }

            const service = await ServiceSchema.findById(appointment.service_id);
            const isAdministrative = service && service.type === ServiceTypeEnum.ADMINISTRATIVE;

            if (!isAdministrative) {
                throw new HttpException(HttpStatus.BadRequest, 'Certificate requests are only available for administrative/legal DNA tests');
            }

            // Check how many times this customer has requested certificate for this result
            const existingRequests = await CertificateRequestSchema.find({
                result_id: resultId,
                customer_id: customerId,
                status: { $ne: 'rejected' }
            }).countDocuments();

            // Determine if this is free (first time) or paid (subsequent times)
            const requestCount = existingRequests + 1;
            const isFree = requestCount === 1;

            // Create certificate request
            const certificateRequest = await CertificateRequestSchema.create({
                result_id: resultId,
                customer_id: customerId,
                request_count: requestCount,
                reason,
                is_paid: isFree, // First request is automatically considered "paid" (free)
                status: isFree ? 'processing' : 'pending', // Free requests go directly to processing
                delivery_address: deliveryAddress,
                created_at: new Date(),
                updated_at: new Date()
            });

            // If not free, create payment
            if (!isFree) {
                try {
                    const PaymentService = require('../payment/payment.service').default;
                    const paymentService = new PaymentService();

                    const payment = await paymentService.createCertificatePayment(
                        customerId,
                        certificateRequest._id.toString(),
                        50000 // 50,000 VND for additional certificate copies
                    );

                    // Update certificate request with payment ID
                    await CertificateRequestSchema.findByIdAndUpdate(
                        certificateRequest._id,
                        { payment_id: payment._id },
                        { new: true }
                    );

                    console.log(`Payment created for certificate request: ${payment._id}`);
                } catch (paymentError) {
                    console.error('Error creating payment for certificate request:', paymentError);
                    // Don't fail the request creation if payment fails
                }
            }

            // Send email notification
            try {
                await this.sendCertificateRequestEmail(certificateRequest, customerId, isFree);
            } catch (emailError) {
                console.error('Error sending certificate request email:', emailError);
            }

            return certificateRequest;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating certificate request');
        }
    }

    /**
     * Get certificate requests for a result
     */
    public async getCertificateRequests(
        resultId: string,
        userId: string,
        userRole: string
    ): Promise<ICertificateRequest[]> {
        try {
            // Validate result exists
            const result = await this.resultRepository.findById(resultId);
            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Result not found');
            }

            // Authorization check
            // if (userRole === UserRoleEnum.CUSTOMER && result.customer_id !== userId) {
            //     throw new HttpException(HttpStatus.Forbidden, 'You are not authorized to view certificate requests for this result');
            // }

            // Get certificate requests
            const requests = await CertificateRequestSchema.find({
                result_id: resultId
            })
                // .populate('customer_id', 'first_name last_name email phone_number')
                .populate('payment_id', 'amount status payment_method created_at')
                .sort({ created_at: -1 });

            return requests;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error retrieving certificate requests');
        }
    }

    /**
     * Update certificate request status
     */
    public async updateCertificateRequestStatus(
        requestId: string,
        status: string,
        agencyNotes?: string,
        staffId?: string
    ): Promise<ICertificateRequest> {
        try {
            const validStatuses = ['pending', 'processing', 'issued', 'rejected'];
            if (!validStatuses.includes(status)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid status');
            }

            const updateData: any = {
                status,
                updated_at: new Date()
            };

            if (agencyNotes) {
                updateData.agency_notes = agencyNotes;
            }

            if (status === 'issued') {
                updateData.certificate_issued_at = new Date();
            }

            const updatedRequest = await CertificateRequestSchema.findByIdAndUpdate(
                requestId,
                updateData,
                { new: true }
            )
                .populate('customer_id', 'first_name last_name email')
                .populate('result_id', '_id report_url');

            if (!updatedRequest) {
                throw new HttpException(HttpStatus.NotFound, 'Certificate request not found');
            }

            // Send email notification about status change
            try {
                await this.sendCertificateStatusUpdateEmail(updatedRequest, status);
            } catch (emailError) {
                console.error('Error sending certificate status update email:', emailError);
            }

            return updatedRequest;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error updating certificate request status');
        }
    }

    /**
     * Send email notification for certificate request
     */
    private async sendCertificateRequestEmail(
        certificateRequest: ICertificateRequest,
        customerId: string,
        isFree: boolean
    ): Promise<void> {
        try {
            const user = await UserSchema.findById(customerId);
            if (!user || !user.email) {
                console.error('Cannot send certificate request email: User not found or no email');
                return;
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
            const title = 'Yêu cầu cấp giấy chứng nhận kết quả xét nghiệm';

            const message = `
                Yêu cầu cấp giấy chứng nhận kết quả xét nghiệm pháp lý của bạn đã được tiếp nhận.
                <br><br>
                <strong>Chi tiết yêu cầu:</strong>
                <br>
                Mã yêu cầu: ${certificateRequest._id}
                <br>
                Lý do yêu cầu: ${certificateRequest.reason}
                <br>
                Loại yêu cầu: ${isFree ? '🆓 Miễn phí (lần đầu)' : '💳 Có phí (lần thứ ' + certificateRequest.request_count + ')'}
                <br>
                Trạng thái: ${certificateRequest.status === 'processing' ? '⏳ Đang xử lý' : '⏸️ Chờ thanh toán'}
                <br><br>
                ${isFree ?
                    'Giấy chứng nhận đầu tiên được cấp miễn phí. Chúng tôi sẽ xử lý yêu cầu trong vòng 3-5 ngày làm việc.' :
                    'Vui lòng hoàn tất thanh toán để chúng tôi tiến hành xử lý yêu cầu. Phí cấp bản sao: 50.000 VNĐ.'
                }
                <br><br>
                Chúng tôi sẽ thông báo khi giấy chứng nhận sẵn sàng để giao.
                <br><br>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <small style="color: #666;">
                    🏥 <strong>Hệ thống xét nghiệm ADN Bloodline</strong><br>
                    📞 Hotline: 1900-1900-1900<br>
                    📧 Email: support@bloodline.vn
                </small>
            `;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: '📋 Yêu cầu cấp giấy chứng nhận - Hệ thống ADN Bloodline',
                html: createNotificationEmailTemplate(userName, title, message)
            };

            await sendMail(emailDetails);
            console.log(`Certificate request email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending certificate request email:', error);
        }
    }

    /**
     * Send email notification for certificate status update
     */
    private async sendCertificateStatusUpdateEmail(
        certificateRequest: any,
        newStatus: string
    ): Promise<void> {
        try {
            const user = certificateRequest.customer_id;
            if (!user || !user.email) {
                console.error('Cannot send certificate status update email: User not found or no email');
                return;
            }

            const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

            let title = '';
            let message = '';
            let statusText = '';
            let statusEmoji = '';

            switch (newStatus) {
                case 'processing':
                    title = 'Yêu cầu giấy chứng nhận đang được xử lý';
                    statusText = 'Đang xử lý';
                    statusEmoji = '⏳';
                    message = 'Yêu cầu cấp giấy chứng nhận của bạn đang được xử lý. Chúng tôi sẽ hoàn tất trong vòng 3-5 ngày làm việc.';
                    break;
                case 'issued':
                    title = 'Giấy chứng nhận đã sẵn sàng';
                    statusText = 'Đã cấp';
                    statusEmoji = '✅';
                    message = 'Giấy chứng nhận kết quả xét nghiệm của bạn đã sẵn sàng. Vui lòng liên hệ để nhận giấy chứng nhận.';
                    break;
                case 'rejected':
                    title = 'Yêu cầu giấy chứng nhận bị từ chối';
                    statusText = 'Bị từ chối';
                    statusEmoji = '❌';
                    message = 'Yêu cầu cấp giấy chứng nhận của bạn đã bị từ chối.';
                    break;
                default:
                    title = 'Cập nhật trạng thái yêu cầu giấy chứng nhận';
                    statusText = newStatus;
                    statusEmoji = '📋';
                    message = 'Trạng thái yêu cầu cấp giấy chứng nhận của bạn đã được cập nhật.';
            }

            const fullMessage = `
                ${message}
                <br><br>
                <strong>Chi tiết yêu cầu:</strong>
                <br>
                Mã yêu cầu: ${certificateRequest._id}
                <br>
                Trạng thái: ${statusEmoji} ${statusText}
                <br>
                Ngày cập nhật: ${new Date().toLocaleString('vi-VN')}
                <br><br>
                ${certificateRequest.agency_notes ? `<strong>Ghi chú:</strong><br>${certificateRequest.agency_notes}<br><br>` : ''}
                ${newStatus === 'issued' ?
                    'Vui lòng mang theo CMND/CCCD và liên hệ với chúng tôi để nhận giấy chứng nhận trong giờ hành chính.' :
                    'Nếu có thắc mắc, vui lòng liên hệ với chúng tôi qua thông tin bên dưới.'
                }
                <br><br>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <small style="color: #666;">
                    🏥 <strong>Hệ thống xét nghiệm ADN Bloodline</strong><br>
                    📞 Hotline: 1900-1900-1900<br>
                    📧 Email: support@bloodline.vn
                </small>
            `;

            const emailDetails: ISendMailDetail = {
                toMail: user.email,
                subject: `📋 ${title} - Hệ thống ADN Bloodline`,
                html: createNotificationEmailTemplate(userName, title, fullMessage)
            };

            await sendMail(emailDetails);
            console.log(`Certificate status update email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending certificate status update email:', error);
        }
    }
} 