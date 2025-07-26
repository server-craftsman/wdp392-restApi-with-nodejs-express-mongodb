import { Document } from 'mongoose';
import { AppointmentLogTypeEnum, AppointmentLogActionEnum } from './appointment_log.enum';
import { CollectionType } from '../appointment/appointment.interface';

export interface IAppointmentLog extends Document {
    _id: string;

    // Basic appointment info
    appointment_id: string | undefined;
    customer_id: string | undefined;
    staff_id: string | undefined;
    laboratory_technician_id: string | undefined;

    // Administrative case info (for legal appointments)
    administrative_case_id?: string | undefined;
    agency_contact_email?: string | undefined;

    // Status changes
    old_status: AppointmentLogTypeEnum | undefined;
    new_status: AppointmentLogTypeEnum;

    // Action and type
    action: AppointmentLogActionEnum;
    type: CollectionType;

    // Additional details
    notes?: string;
    metadata?: {
        // For staff assignments
        assigned_staff_ids?: string[];
        unassigned_staff_ids?: string[];

        // For lab tech assignments
        assigned_lab_tech_id?: string;

        // For check-ins
        checkin_location?: string;
        checkin_note?: string;

        // For administrative actions
        case_status_update?: string;
        agency_notified?: boolean;
        authorization_code?: string;

        // General metadata
        user_agent?: string;
        ip_address?: string;
        additional_data?: any;
    };

    // Timestamps
    action_timestamp: Date; // When the action actually occurred
    created_at: Date;
    updated_at: Date;

    // User who performed the action
    performed_by_user_id: string | undefined;
    performed_by_role?: string; // ADMIN, STAFF, CUSTOMER, etc.
}
