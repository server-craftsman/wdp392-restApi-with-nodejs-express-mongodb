import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IAppointmentLog } from './appointment_log.interface';
import { AppointmentLogTypeEnum, AppointmentLogActionEnum } from './appointment_log.enum';
import { TypeEnum } from '../appointment/appointment.enum';

const AppointmentLogSchemaEntity = new Schema<IAppointmentLog>({
    // Basic appointment info
    appointment_id: { type: String, required: true },
    customer_id: { type: String },
    staff_id: { type: String },
    laboratory_technician_id: { type: String },

    // Administrative case info
    administrative_case_id: { type: String },
    agency_contact_email: { type: String },

    // Status changes
    old_status: {
        type: String,
        enum: Object.values(AppointmentLogTypeEnum)
    },
    new_status: {
        type: String,
        enum: Object.values(AppointmentLogTypeEnum),
        required: true
    },

    // Action and type
    action: {
        type: String,
        enum: Object.values(AppointmentLogActionEnum),
        required: true
    },
    type: {
        type: String,
        enum: Object.values(TypeEnum),
        required: true
    },

    // Additional details
    notes: { type: String },
    metadata: {
        // Staff assignments
        assigned_staff_ids: [{ type: String }],
        unassigned_staff_ids: [{ type: String }],

        // Lab tech assignments
        assigned_lab_tech_id: { type: String },

        // Check-ins
        checkin_location: { type: String },
        checkin_note: { type: String },

        // Administrative actions
        case_status_update: { type: String },
        agency_notified: { type: Boolean },
        authorization_code: { type: String },

        // General metadata
        user_agent: { type: String },
        ip_address: { type: String },
        additional_data: { type: Schema.Types.Mixed }
    },

    // Timestamps
    action_timestamp: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },

    // User who performed the action
    performed_by_user_id: { type: String, required: true },
    performed_by_role: { type: String }
});

const AppointmentLogSchema = mongoose.model<IAppointmentLog>(
    COLLECTION_NAME.APPOINTMENT_LOG,
    AppointmentLogSchemaEntity
);

export default AppointmentLogSchema;  
