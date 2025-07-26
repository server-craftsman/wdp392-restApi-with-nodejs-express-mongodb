import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IAppointmentLog } from './appointment_log.interface';
import { AppointmentLogTypeEnum, AppointmentLogActionEnum } from './appointment_log.enum';
import AppointmentLogRepository from './appointment_log.repository';
import { IAppointment } from '../appointment/appointment.interface';
import { SearchPaginationResponseModel } from '../../core/models';
import mongoose from 'mongoose';
import { ISample } from '../sample/sample.interface';

export default class AppointmentLogService {
    private appointmentLogRepository = new AppointmentLogRepository();

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
     * Create a comprehensive appointment log entry
     */
    public async createAppointmentLog(
        appointmentData: IAppointment,
        action: AppointmentLogActionEnum,
        performedByUserId: string,
        performedByRole?: string,
        oldStatus?: AppointmentLogTypeEnum,
        newStatus?: AppointmentLogTypeEnum,
        notes?: string,
        metadata?: any,
    ): Promise<IAppointmentLog> {
        try {
            const logData = {
                appointment_id: appointmentData._id as any,
                customer_id: appointmentData.user_id,
                staff_id: appointmentData.staff_id,
                laboratory_technician_id: appointmentData.laboratory_technician_id,
                administrative_case_id: appointmentData.administrative_case_id,
                agency_contact_email: appointmentData.agency_contact_email,
                old_status: oldStatus,
                new_status: newStatus || oldStatus || this.convertStatusToLogType(appointmentData.status),
                action: action,
                type: appointmentData.type as any, // Cast to handle type mismatch
                notes: notes,
                metadata: metadata,
                action_timestamp: new Date(),
                performed_by_user_id: performedByUserId,
                performed_by_role: performedByRole,
                created_at: new Date(),
                updated_at: new Date(),
            };

            return await this.appointmentLogRepository.create(logData);
        } catch (error) {
            console.error('Error creating appointment log:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating appointment log');
        }
    }

    /**
     * Log appointment creation
     */
    public async logAppointmentCreation(appointmentData: IAppointment, performedByUserId: string, performedByRole?: string): Promise<IAppointmentLog> {
        return this.createAppointmentLog(appointmentData, AppointmentLogActionEnum.CREATE, performedByUserId, performedByRole, undefined, this.convertStatusToLogType(appointmentData.status), 'Appointment created successfully');
    }

    /**
     * Log administrative appointment creation
     */
    public async logAdministrativeAppointmentCreation(appointmentData: IAppointment, caseId: string, performedByUserId: string, performedByRole?: string): Promise<IAppointmentLog> {
        return this.createAppointmentLog(
            appointmentData,
            AppointmentLogActionEnum.CREATE,
            performedByUserId,
            performedByRole,
            undefined,
            this.convertStatusToLogType(appointmentData.status),
            'Administrative appointment created for legal case',
            {
                case_id: caseId,
                is_administrative: true,
                government_funded: true,
            },
        );
    }

    /**
     * Log status update
     */
    public async logStatusUpdate(appointmentData: IAppointment, oldStatus: AppointmentLogTypeEnum, newStatus: AppointmentLogTypeEnum, performedByUserId: string, performedByRole?: string, notes?: string): Promise<IAppointmentLog> {
        return this.createAppointmentLog(appointmentData, AppointmentLogActionEnum.UPDATE_STATUS, performedByUserId, performedByRole, oldStatus, newStatus, notes || `Status changed from ${oldStatus} to ${newStatus}`);
    }

    /**
     * Log staff assignment
     */
    public async logStaffAssignment(appointmentData: IAppointment, assignedStaffIds: string[], performedByUserId: string, performedByRole?: string): Promise<IAppointmentLog> {
        const currentStatus = this.convertStatusToLogType(appointmentData.status);
        return this.createAppointmentLog(appointmentData, AppointmentLogActionEnum.ASSIGN_STAFF, performedByUserId, performedByRole, currentStatus, currentStatus, `Staff assigned to appointment`, {
            assigned_staff_ids: assignedStaffIds,
        });
    }

    /**
     * Log staff unassignment
     */
    public async logStaffUnassignment(appointmentData: IAppointment, unassignedStaffIds: string[], performedByUserId: string, performedByRole?: string): Promise<IAppointmentLog> {
        const currentStatus = this.convertStatusToLogType(appointmentData.status);
        return this.createAppointmentLog(appointmentData, AppointmentLogActionEnum.ASSIGN_STAFF, performedByUserId, performedByRole, currentStatus, currentStatus, `Staff unassigned from appointment`, {
            unassigned_staff_ids: unassignedStaffIds,
        });
    }

    /**
     * Log lab technician assignment
     */
    public async logLabTechAssignment(appointmentData: IAppointment, labTechId: string, performedByUserId: string, performedByRole?: string): Promise<IAppointmentLog> {
        const currentStatus = this.convertStatusToLogType(appointmentData.status);
        return this.createAppointmentLog(appointmentData, AppointmentLogActionEnum.ASSIGN_LAB_TECH, performedByUserId, performedByRole, currentStatus, currentStatus, `Laboratory technician assigned to appointment`, {
            assigned_lab_tech_id: labTechId,
        });
    }

    /**
     * Log check-in
     */
    public async logCheckin(appointmentData: IAppointment, performedByUserId: string, performedByRole?: string, checkinNote?: string, location?: string): Promise<IAppointmentLog> {
        const currentStatus = this.convertStatusToLogType(appointmentData.status);
        return this.createAppointmentLog(appointmentData, AppointmentLogActionEnum.CHECKIN, performedByUserId, performedByRole, currentStatus, currentStatus, checkinNote || 'Staff checked in at appointment location', {
            checkin_location: location || appointmentData.collection_address,
            checkin_note: checkinNote,
        });
    }

    /**
     * Log note addition
     */
    public async logNoteAddition(appointmentData: IAppointment, note: string, performedByUserId: string, performedByRole?: string): Promise<IAppointmentLog> {
        const currentStatus = this.convertStatusToLogType(appointmentData.status);
        return this.createAppointmentLog(appointmentData, AppointmentLogActionEnum.ADD_NOTE, performedByUserId, performedByRole, currentStatus, currentStatus, `Note added: ${note}`);
    }

    /**
     * Log administrative progress update
     */
    public async logAdministrativeProgressUpdate(
        appointmentData: IAppointment,
        oldStatus: AppointmentLogTypeEnum,
        newStatus: AppointmentLogTypeEnum,
        caseStatusUpdate: string,
        performedByUserId: string,
        performedByRole?: string,
    ): Promise<IAppointmentLog> {
        return this.createAppointmentLog(appointmentData, AppointmentLogActionEnum.PROGRESS_UPDATE, performedByUserId, performedByRole, oldStatus, newStatus, `Administrative appointment progress updated`, {
            case_status_update: caseStatusUpdate,
            is_administrative: true,
        });
    }

    /**
     * Log agency notification
     */
    public async logAgencyNotification(appointmentData: IAppointment, agencyEmail: string, performedByUserId: string, performedByRole?: string): Promise<IAppointmentLog> {
        const currentStatus = this.convertStatusToLogType(appointmentData.status);
        return this.createAppointmentLog(appointmentData, AppointmentLogActionEnum.AGENCY_NOTIFICATION, performedByUserId, performedByRole, currentStatus, currentStatus, `Notification sent to agency: ${agencyEmail}`, {
            agency_notified: true,
            agency_email: agencyEmail,
        });
    }

    /**
     * Get appointment logs with pagination
     */
    public async getAppointmentLogs(appointmentId: string, pageNum: number = 1, pageSize: number = 10): Promise<SearchPaginationResponseModel<IAppointmentLog>> {
        try {
            const query = { appointment_id: appointmentId };
            const skip = (pageNum - 1) * pageSize;

            const [logs, totalCount] = await Promise.all([this.appointmentLogRepository.find(query, { created_at: -1 }, skip, pageSize), this.appointmentLogRepository.countDocuments(query)]);

            const totalPages = Math.ceil(totalCount / pageSize);

            return new SearchPaginationResponseModel(logs, {
                totalItems: totalCount,
                totalPages,
                pageNum,
                pageSize,
            });
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching appointment logs');
        }
    }

    /**
     * Get administrative case logs
     */
    public async getAdministrativeCaseLogs(caseId: string, pageNum: number = 1, pageSize: number = 10): Promise<SearchPaginationResponseModel<IAppointmentLog>> {
        try {
            const query = { administrative_case_id: caseId };
            const skip = (pageNum - 1) * pageSize;

            const [logs, totalCount] = await Promise.all([this.appointmentLogRepository.find(query, { created_at: -1 }, skip, pageSize), this.appointmentLogRepository.countDocuments(query)]);

            const totalPages = Math.ceil(totalCount / pageSize);

            return new SearchPaginationResponseModel(logs, {
                totalItems: totalCount,
                totalPages,
                pageNum,
                pageSize,
            });
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching administrative case logs');
        }
    }

    /**
     * Get logs by action type
     */
    public async getLogsByAction(action: AppointmentLogActionEnum, pageNum: number = 1, pageSize: number = 10): Promise<SearchPaginationResponseModel<IAppointmentLog>> {
        try {
            const query = { action };
            const skip = (pageNum - 1) * pageSize;

            const [logs, totalCount] = await Promise.all([this.appointmentLogRepository.find(query, { created_at: -1 }, skip, pageSize), this.appointmentLogRepository.countDocuments(query)]);

            const totalPages = Math.ceil(totalCount / pageSize);

            return new SearchPaginationResponseModel(logs, {
                totalItems: totalCount,
                totalPages,
                pageNum,
                pageSize,
            });
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching logs by action');
        }
    }

    /**
     * Get appointment timeline (chronological activity)
     */
    public async getAppointmentTimeline(appointmentId: string): Promise<IAppointmentLog[]> {
        try {
            return await this.appointmentLogRepository.find({ appointment_id: appointmentId }, { action_timestamp: 1 });
        } catch (error) {
            console.error('Error fetching appointment timeline:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching appointment timeline');
        }
    }

    /**
     * Get comprehensive log statistics for dashboard
     */
    public async getLogStatistics(startDate?: string, endDate?: string): Promise<any> {
        try {
            // Build date filter
            const dateFilter: any = {};
            if (startDate || endDate) {
                dateFilter.action_timestamp = {};
                if (startDate) {
                    dateFilter.action_timestamp.$gte = new Date(startDate);
                }
                if (endDate) {
                    dateFilter.action_timestamp.$lte = new Date(endDate);
                }
            }

            // Get total logs count
            const totalLogs = await this.appointmentLogRepository.countDocuments(dateFilter);

            // Get logs by action type
            const logsByAction = await this.appointmentLogRepository.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$action',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get logs by status
            const logsByStatus = await this.appointmentLogRepository.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$new_status',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get logs by appointment type
            const logsByType = await this.appointmentLogRepository.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get administrative appointments count
            const adminAppointments = await this.appointmentLogRepository.countDocuments({
                ...dateFilter,
                administrative_case_id: { $exists: true, $ne: null }
            });

            // Get logs by user role (who performed the action)
            const logsByRole = await this.appointmentLogRepository.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$performed_by_role',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get daily activity for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const dailyActivity = await this.appointmentLogRepository.aggregate([
                {
                    $match: {
                        ...dateFilter,
                        action_timestamp: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$action_timestamp'
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Get most active staff members
            const mostActiveStaff = await this.appointmentLogRepository.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$performed_by_user_id',
                        count: { $sum: 1 },
                        actions: { $addToSet: '$action' }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            // Get recent activity (last 10 logs)
            const recentActivity = await this.appointmentLogRepository.find(dateFilter, { action_timestamp: -1 }, 0, 10);

            // Convert arrays to objects for easier frontend consumption
            const logsByActionObj = logsByAction.reduce((acc: any, item: any) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            const logsByStatusObj = logsByStatus.reduce((acc: any, item: any) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            const logsByTypeObj = logsByType.reduce((acc: any, item: any) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            const logsByRoleObj = logsByRole.reduce((acc: any, item: any) => {
                acc[item._id || 'unknown'] = item.count;
                return acc;
            }, {});

            return {
                summary: {
                    totalLogs,
                    adminAppointments,
                    dateRange: {
                        startDate: startDate || null,
                        endDate: endDate || null
                    }
                },
                breakdowns: {
                    byAction: logsByActionObj,
                    byStatus: logsByStatusObj,
                    byType: logsByTypeObj,
                    byRole: logsByRoleObj
                },
                trends: {
                    dailyActivity,
                    mostActiveStaff: mostActiveStaff.map((staff: any) => ({
                        userId: staff._id,
                        actionCount: staff.count,
                        uniqueActions: staff.actions.length
                    }))
                },
                recentActivity
            };
        } catch (error) {
            console.error('Error fetching log statistics:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching log statistics');
        }
    }

    /**
     * Log status change (alias for logStatusUpdate)
     */
    public async logStatusChange(appointmentData: IAppointment, oldStatus: AppointmentLogTypeEnum, newStatus: AppointmentLogTypeEnum, performedByUserId?: string): Promise<IAppointmentLog> {
        return this.logStatusUpdate(appointmentData, oldStatus, newStatus, performedByUserId || 'system', 'SYSTEM');
    }
}
