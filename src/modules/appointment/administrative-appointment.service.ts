import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { TypeEnum, AppointmentStatusEnum, PaymentStatusEnum, AppointmentPaymentStageEnum } from './appointment.enum';
import { IAppointment } from './appointment.interface';
import AppointmentRepository from './appointment.repository';
import AdministrativeCasesService from '../administrative_cases/administrative_cases.service';
import ServiceService from '../service/service.service';
import PaymentService from '../payment/payment.service';
import AppointmentLogService from '../appointment_log/appointment_log.service';
import { AppointmentLogTypeEnum } from '../appointment_log/appointment_log.enum';
import { sendMail } from '../../core/utils';
import { ISendMailDetail } from '../../core/interfaces';
import { UserRoleEnum } from '../user';

export default class AdministrativeAppointmentService {
    private readonly appointmentRepository: AppointmentRepository;
    private readonly administrativeCaseService: AdministrativeCasesService;
    private readonly serviceService: ServiceService;
    private readonly paymentService: PaymentService;
    private readonly appointmentLogService: AppointmentLogService;

    constructor() {
        this.appointmentRepository = new AppointmentRepository();
        this.administrativeCaseService = new AdministrativeCasesService();
        this.serviceService = new ServiceService();
        this.paymentService = new PaymentService();
        this.appointmentLogService = new AppointmentLogService();
    }

    /**
     * Convert AppointmentStatusEnum to AppointmentLogTypeEnum
     */
    private convertStatusToLogType(status: any): AppointmentLogTypeEnum {
        // Map appointment status to log type
        const statusMap: Record<string, AppointmentLogTypeEnum> = {
            pending: AppointmentLogTypeEnum.PENDING,
            confirmed: AppointmentLogTypeEnum.CONFIRMED,
            sample_assigned: AppointmentLogTypeEnum.SAMPLE_ASSIGNED,
            sample_collected: AppointmentLogTypeEnum.SAMPLE_COLLECTED,
            sample_received: AppointmentLogTypeEnum.SAMPLE_RECEIVED,
            testing: AppointmentLogTypeEnum.TESTING,
            completed: AppointmentLogTypeEnum.COMPLETED,
            cancelled: AppointmentLogTypeEnum.CANCELLED,
            awaiting_authorization: AppointmentLogTypeEnum.AWAITING_AUTHORIZATION,
            authorized: AppointmentLogTypeEnum.AUTHORIZED,
            ready_for_collection: AppointmentLogTypeEnum.READY_FOR_COLLECTION,
        };

        return statusMap[status] || AppointmentLogTypeEnum.PENDING;
    }

    /**
     * Create administrative appointment (for legal cases)
     */
    public async createAdministrativeAppointment(
        caseId: string,
        appointmentData: {
            service_id: string;
            user_id?: string;
            appointment_date?: Date | string;
            collection_address?: string;
            staff_id?: string;
            laboratory_technician_id?: string;
            participants: string[]; // IDs of participants
        },
        createdByUserId: string,
    ): Promise<IAppointment> {
        try {
            console.log('=== CREATING ADMINISTRATIVE APPOINTMENT ===');
            console.log('Case ID:', caseId);
            console.log('Appointment data:', JSON.stringify(appointmentData, null, 2));
            console.log('Created by user ID:', createdByUserId);

            // Verify administrative case exists and is approved
            const adminCase = await this.administrativeCaseService.getAdministrativeCaseById(caseId);
            if (!adminCase) {
                throw new HttpException(HttpStatus.BadRequest, 'Administrative case not found');
            }

            if (adminCase.status !== 'approved') {
                throw new HttpException(HttpStatus.BadRequest, 'Administrative case must be approved before scheduling appointment');
            }

            // Ensure staff_id is set from the case
            if (!appointmentData.staff_id) {
                if (!adminCase.assigned_staff_id) {
                    throw new HttpException(HttpStatus.BadRequest, 'Case must have an assigned staff member before creating appointment');
                }
                appointmentData.staff_id = adminCase.assigned_staff_id;
                console.log('Auto-assigned staff_id from case:', appointmentData.staff_id);
                console.log('Auto-assigned staff_id type:', typeof appointmentData.staff_id);
            } else {
                // Use provided staff_id without validation against case assignment
                console.log('Using provided staff_id:', appointmentData.staff_id);
            }

            // Validate service
            const service = await this.serviceService.getServiceById(appointmentData.service_id);
            if (!service) {
                throw new HttpException(HttpStatus.BadRequest, 'Service not found');
            }

            // Set appointment date - handle validation properly
            let appointmentDate: Date;

            // If no appointment_date provided, use current date + 1 day
            if (!appointmentData.appointment_date) {
                appointmentDate = new Date();
                appointmentDate.setDate(appointmentDate.getDate() + 1); // Next day
            } else {
                // Handle both Date objects and string dates
                if (appointmentData.appointment_date instanceof Date) {
                    appointmentDate = appointmentData.appointment_date;
                } else if (typeof appointmentData.appointment_date === 'string') {
                    // Try to parse the string date - accept both ISO strings and other valid date formats
                    const parsedDate = new Date(appointmentData.appointment_date);
                    if (isNaN(parsedDate.getTime())) {
                        throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment date format. Please provide a valid date string or ISO 8601 format');
                    }
                    appointmentDate = parsedDate;
                } else {
                    throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment date format. Must be a Date object or valid date string');
                }

                // Additional validation: if it's a valid date object, ensure it's properly formatted
                if (isNaN(appointmentDate.getTime())) {
                    throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment date. Please provide a valid date');
                }

                // Check if appointment date is in the future
                const now = new Date();
                now.setHours(0, 0, 0, 0); // Reset time to compare only dates
                const compareDateOnly = new Date(appointmentDate);
                compareDateOnly.setHours(0, 0, 0, 0);

                if (compareDateOnly < now) {
                    throw new HttpException(HttpStatus.BadRequest, 'Appointment date must be in the future');
                }
            }

            // Set to 10 AM for the appointment while preserving the date
            appointmentDate.setHours(10, 0, 0, 0);

            // Create appointment with administrative type
            const newAppointment: Partial<IAppointment> = {
                user_id: appointmentData.user_id,
                service_id: appointmentData.service_id,
                appointment_date: appointmentDate,
                type: TypeEnum.ADMINISTRATIVE,
                collection_address: appointmentData.collection_address,
                status: AppointmentStatusEnum.AUTHORIZED,
                payment_status: PaymentStatusEnum.GOVERNMENT_FUNDED,
                payment_stage: AppointmentPaymentStageEnum.GOVERNMENT_PAID as any,
                total_amount: 0,
                deposit_amount: 0,
                amount_paid: 0,
                administrative_case_id: caseId,
                staff_id: appointmentData.staff_id,
                laboratory_technician_id: appointmentData.laboratory_technician_id,
                agency_contact_email: adminCase.agency_contact_email,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const appointment = await this.appointmentRepository.create(newAppointment);

            // Try to update administrative case (non-critical)
            try {
                await this.administrativeCaseService.addAppointmentToCase(caseId, appointment._id);
            } catch (addToCaseError) {
                console.warn('Non-critical: Could not add appointment to case:', addToCaseError);
            }

            // Try to create payment record (non-critical)
            try {
                // For administrative appointments, use createdByUserId if appointment doesn't have user_id
                const paymentUserId = appointment.user_id || createdByUserId;
                await this.paymentService.createAdministrativePayment(appointment._id, paymentUserId);
            } catch (paymentError) {
                console.warn('Non-critical: Could not create administrative payment:', paymentError);
            }

            // Try to log appointment creation (non-critical)
            try {
                await this.appointmentLogService.logAdministrativeAppointmentCreation(appointment, caseId, createdByUserId, UserRoleEnum.STAFF);
            } catch (logError) {
                console.warn('Non-critical: Could not log appointment creation:', logError);
            }

            // Try to send notification (non-critical)
            try {
                // Only send email notification if appointment has a user_id
                if (appointment.user_id) {
                    await this.sendAdministrativeAppointmentNotification(appointment, adminCase);
                    await this.appointmentLogService.logAgencyNotification(appointment, adminCase.agency_contact_email, createdByUserId, UserRoleEnum.STAFF);
                } else {
                    // For appointments without user_id, only log the agency notification
                    await this.appointmentLogService.logAgencyNotification(appointment, adminCase.agency_contact_email, createdByUserId, UserRoleEnum.STAFF);
                }
            } catch (emailError) {
                console.warn('Non-critical: Could not send notification:', emailError);
            }

            return appointment;
        } catch (error: any) {
            console.error('Error in createAdministrativeAppointment:', error);

            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, `Error creating administrative appointment: ${error.message}`);
        }
    }

    /**
     * Send notification to agency about appointment scheduling
     */
    private async sendAdministrativeAppointmentNotification(appointment: any, adminCase: any): Promise<void> {
        try {
            const emailDetails: ISendMailDetail = {
                toMail: adminCase.agency_contact_email,
                subject: `DNA Testing Appointment Scheduled - Case ${adminCase.case_number}`,
                html: `
                    <h2>DNA Testing Appointment Scheduled</h2>
                    <p>Dear ${adminCase.agency_contact_name},</p>
                    <p>The DNA testing appointment for case <strong>${adminCase.case_number}</strong> has been scheduled.</p>
                    
                    <h3>Appointment Details:</h3>
                    <ul>
                        <li><strong>Date & Time:</strong> ${new Date(appointment.appointment_date).toLocaleString()}</li>
                        <li><strong>Type:</strong> Administrative</li>
                        <li><strong>Collection Address:</strong> ${appointment.collection_address || 'At facility'}</li>
                        <li><strong>Case Type:</strong> ${adminCase.case_type}</li>
                        <li><strong>Authorization Code:</strong> ${adminCase.authorization_code || 'Pending'}</li>
                    </ul>
                    
                    <h3>Next Steps:</h3>
                    <p>1. Ensure all participants are prepared for sample collection</p>
                    <p>2. Required documents should be available during appointment</p>
                    <p>3. Results will be delivered according to specified method</p>
                    
                    <p>If you need to make any changes, please contact us immediately.</p>
                    
                    <p>Best regards,<br/>
                    Bloodline DNA Testing Service</p>
                `,
            };

            await sendMail(emailDetails);
        } catch (error) {
            console.error('Error sending administrative appointment notification:', error);
        }
    }

    /**
     * Update administrative case status based on appointment progress
     */
    public async updateAdministrativeCaseProgress(appointmentId: string, newStatus: AppointmentStatusEnum): Promise<void> {
        try {
            const appointment = await this.appointmentRepository.findById(appointmentId);
            if (!appointment || !appointment.administrative_case_id) {
                return;
            }

            // Update appointment status first
            const oldStatus = appointment.status;
            const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(
                appointmentId,
                {
                    status: newStatus,
                    updated_at: new Date(),
                },
                { new: true },
            );

            if (!updatedAppointment) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to update appointment status');
            }

            // Log the progress update
            try {
                await this.appointmentLogService.logAdministrativeProgressUpdate(
                    updatedAppointment,
                    this.convertStatusToLogType(oldStatus),
                    this.convertStatusToLogType(newStatus),
                    `Administrative case progress updated`,
                    'system', // Could be enhanced to track actual user
                    'SYSTEM',
                );
            } catch (logError) {
                console.error('Failed to log administrative progress update:', logError);
            }

            // Update administrative case status
            let caseStatus = null;
            switch (newStatus) {
                case AppointmentStatusEnum.SAMPLE_COLLECTED:
                    caseStatus = 'in_progress';
                    break;
                case AppointmentStatusEnum.TESTING:
                    caseStatus = 'in_progress';
                    break;
                case AppointmentStatusEnum.COMPLETED:
                    caseStatus = 'completed';
                    break;
            }

            if (caseStatus) {
                await this.administrativeCaseService.updateCaseStatus(appointment.administrative_case_id, caseStatus);
            }
        } catch (error) {
            console.error('Error updating administrative case progress:', error);
        }
    }

    /**
     * Get appointment by ID
     */
    public async getAppointmentById(appointmentId: string): Promise<IAppointment | null> {
        try {
            return await this.appointmentRepository.findById(appointmentId);
        } catch (error) {
            console.error('Error fetching appointment by ID:', error);
            return null;
        }
    }

    /**
     * Get all appointments for an administrative case
     */
    public async getAppointmentsByCase(caseId: string): Promise<IAppointment[]> {
        try {
            return await this.appointmentRepository.find({ administrative_case_id: caseId });
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching case appointments');
        }
    }

    /**
     * Validate user permissions for appointment operations
     */
    public async validateUserPermissions(caseId: string, userId: string, userRole: string): Promise<{
        canAccess: boolean;
        reason?: string;
        caseDetails?: any;
    }> {
        try {
            console.log('=== VALIDATE USER PERMISSIONS DEBUG ===');
            console.log('Case ID:', caseId);
            console.log('User ID:', userId);
            console.log('User Role:', userRole);

            const adminCase = await this.administrativeCaseService.getAdministrativeCaseById(caseId);
            if (!adminCase) {
                console.log('Case not found');
                return { canAccess: false, reason: 'Administrative case not found' };
            }

            console.log('Admin case found:', {
                case_number: adminCase.case_number,
                status: adminCase.status,
                assigned_staff_id: adminCase.assigned_staff_id,
                assigned_staff_id_type: typeof adminCase.assigned_staff_id
            });

            // Admin and Manager can access all cases
            if (userRole === 'admin' || userRole === 'manager') {
                console.log('Admin/Manager access granted');
                return {
                    canAccess: true,
                    caseDetails: {
                        assigned_staff_id: adminCase.assigned_staff_id,
                        status: adminCase.status,
                        case_number: adminCase.case_number
                    }
                };
            }

            // Staff can access any case (removed assignment check)
            if (userRole === 'staff') {
                console.log('Staff access granted (no assignment check)');
                return {
                    canAccess: true,
                    caseDetails: {
                        assigned_staff_id: adminCase.assigned_staff_id,
                        status: adminCase.status,
                        case_number: adminCase.case_number
                    }
                };
            }

            console.log('Insufficient permissions');
            return { canAccess: false, reason: 'Insufficient permissions' };
        } catch (error) {
            console.error('Error validating user permissions:', error);
            return { canAccess: false, reason: 'Error validating permissions' };
        }
    }

    /**
     * Get case details for appointment creation
     */
    public async getCaseDetails(caseId: string): Promise<any> {
        try {
            const adminCase = await this.administrativeCaseService.getAdministrativeCaseById(caseId);
            if (!adminCase) {
                return null;
            }

            return {
                case_number: adminCase.case_number,
                status: adminCase.status,
                assigned_staff_id: adminCase.assigned_staff_id,
                agency_contact_email: adminCase.agency_contact_email,
                agency_contact_name: adminCase.agency_contact_name,
                case_type: adminCase.case_type,
                authorization_code: adminCase.authorization_code,
            };
        } catch (error) {
            console.error('Error getting case details:', error);
            return null;
        }
    }

    /**
     * Validate if appointment can be created for the case
     */
    public async validateAppointmentCreation(caseId: string): Promise<{
        canCreate: boolean;
        reason?: string;
    }> {
        try {
            const adminCase = await this.administrativeCaseService.getAdministrativeCaseById(caseId);

            if (!adminCase) {
                return { canCreate: false, reason: 'Administrative case not found' };
            }

            if (adminCase.status !== 'approved') {
                return { canCreate: false, reason: 'Case must be approved before scheduling' };
            }

            // Check if there are already appointments
            const existingAppointments = await this.getAppointmentsByCase(caseId);
            if (existingAppointments.length > 0) {
                const activeAppointments = existingAppointments.filter((apt) => apt.status !== AppointmentStatusEnum.CANCELLED);

                if (activeAppointments.length > 0) {
                    return {
                        canCreate: false,
                        reason: 'Case already has active appointments',
                    };
                }
            }

            return { canCreate: true };
        } catch (error) {
            return { canCreate: false, reason: 'Error validating appointment creation' };
        }
    }
}
