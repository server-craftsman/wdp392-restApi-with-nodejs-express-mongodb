import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { AppointmentStatuses, CollectionTypes } from './appointment.constant';
import { IAppointment } from './appointment.interface';
import { AppointmentStatusEnum, TypeEnum, PaymentStatusEnum } from './appointment.enum';

const AppointmentSchemaEntity: Schema<IAppointment> = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    service_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SERVICE, required: true },
    slot_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SLOT },
    staff_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
    laboratory_technician_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
    agency_contact_email: { type: String }, // Thêm trường này để lưu email của agency tại thời điểm tạo appointment
    appointment_date: { type: Date, required: true }, // Thêm trường này để lưu ngày tạo appointment
    type: {
        type: String,
        enum: Object.values(TypeEnum),
        required: true
    },
    collection_address: { type: String },
    status: {
        type: String,
        enum: Object.values(AppointmentStatusEnum),
        required: true,
        default: AppointmentStatusEnum.PENDING
    },
    payment_status: {
        type: String,
        enum: Object.values(PaymentStatusEnum),
        required: true,
        default: PaymentStatusEnum.UNPAID
    },
    administrative_case_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.ADMINISTRATIVE_CASE, required: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const AppointmentSchema = mongoose.model<IAppointment & mongoose.Document>(
    COLLECTION_NAME.APPOINTMENT,
    AppointmentSchemaEntity
);

export default AppointmentSchema;
