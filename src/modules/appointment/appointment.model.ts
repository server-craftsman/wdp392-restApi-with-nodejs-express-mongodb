import mongoose, { Schema } from 'mongoose';
import { IAppointment } from './appointment.interface';
import { AppointmentStatusEnum, TypeEnum, PaymentStatusEnum, AppointmentPaymentStageEnum, ReservationTypeEnum, ReservationStatusEnum, ReservationPaymentTypeEnum, TestingNeedEnum } from './appointment.enum';
import { COLLECTION_NAME } from '../../core/constants';

const appointmentSchema = new Schema<IAppointment>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: false }, // Made optional for administrative appointments
        service_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SERVICE, required: true },
        slot_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SLOT },
        staff_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
        laboratory_technician_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
        agency_contact_email: { type: String },
        email: { type: String },
        appointment_date: { type: Date, required: true },
        type: { type: String, enum: Object.values(TypeEnum), required: true },
        collection_address: { type: String },
        status: { type: String, enum: Object.values(AppointmentStatusEnum), default: AppointmentStatusEnum.PENDING },
        payment_status: { type: String, enum: Object.values(PaymentStatusEnum), default: PaymentStatusEnum.UNPAID },
        total_amount: { type: Number },
        deposit_amount: { type: Number },
        amount_paid: { type: Number },
        payment_stage: { type: String, enum: Object.values(AppointmentPaymentStageEnum), default: AppointmentPaymentStageEnum.UNPAID },
        administrative_case_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.ADMINISTRATIVE_CASE },
        checkin_logs: [
            {
                staff_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
                time: { type: Date },
                note: { type: String },
            },
        ],
        notes: [{ type: String }],
    },
    {
        timestamps: true,
    },
);

// Reservation Schema for administrative service bookings
const reservationSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    service_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SERVICE, required: true },
    reservation_type: {
        type: String,
        enum: Object.values(ReservationTypeEnum),
        default: ReservationTypeEnum.ADMINISTRATIVE_SERVICE
    },
    testing_need: {
        type: String,
        enum: Object.values(TestingNeedEnum),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(ReservationStatusEnum),
        default: ReservationStatusEnum.PENDING
    },
    payment_status: {
        type: String,
        enum: Object.values(PaymentStatusEnum),
        default: PaymentStatusEnum.UNPAID
    },
    payment_type: {
        type: String,
        enum: Object.values(ReservationPaymentTypeEnum),
        default: ReservationPaymentTypeEnum.DEPOSIT
    },
    total_amount: { type: Number, required: true },
    deposit_amount: { type: Number, required: true },
    amount_paid: { type: Number, default: 0 },
    remaining_amount: { type: Number },
    preferred_appointment_date: { type: Date },
    preferred_time_slots: [{ type: String }],
    collection_type: {
        type: String,
        enum: Object.values(TypeEnum),
        default: TypeEnum.FACILITY
    },
    collection_address: { type: String },
    contact_phone: { type: Number, required: true },
    contact_email: { type: String, required: true },
    special_requirements: { type: String },
    notes: [{ type: String }],
    reservation_expires_at: { type: Date, required: true },
    converted_to_appointment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT },
    payment_history: [
        {
            payment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.PAYMENT },
            amount: { type: Number },
            payment_date: { type: Date },
            payment_method: { type: String },
            status: { type: String },
        }
    ],
}, {
    timestamps: true,
});

// Indexes for better query performance
reservationSchema.index({ user_id: 1, status: 1 });
reservationSchema.index({ service_id: 1 });
reservationSchema.index({ testing_need: 1 });
reservationSchema.index({ reservation_expires_at: 1 });
reservationSchema.index({ status: 1, reservation_expires_at: 1 });

const Appointment = mongoose.model<IAppointment>(COLLECTION_NAME.APPOINTMENT, appointmentSchema);
const Reservation = mongoose.model(COLLECTION_NAME.RESERVATION, reservationSchema);

export { Appointment, Reservation };
export default Appointment;
