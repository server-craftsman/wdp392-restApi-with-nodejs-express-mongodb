import { Reservation } from './appointment.model';
import { IReservation, ICreateReservationRequest, IUpdateReservationRequest, IReservationPaymentRequest } from './appointment.interface';
import { ReservationStatusEnum, ReservationTypeEnum, ReservationPaymentTypeEnum, PaymentStatusEnum, TestingNeedEnum, AppointmentStatusEnum, TypeEnum } from './appointment.enum';
import { PaymentTypeEnum, PaymentStatusEnum as PaymentStatus } from '../payment/payment.enum';
import { HttpException } from '../../core/exceptions';
import { HttpStatus } from '../../core/enums';
import ServiceSchema from '../service/service.model';
import PaymentSchema from '../payment/payment.model';
import { v4 as uuidv4 } from 'uuid';
import { ServiceTypeEnum } from '../service/service.enum';

export default class ReservationService {
    /**
     * Create a new reservation for administrative service
     */
    public async createReservation(userId: string, data: ICreateReservationRequest): Promise<IReservation> {
        // Validate service exists and is active
        const service = await ServiceSchema.findById(data.service_id);
        if (!service) {
            throw new HttpException(HttpStatus.NotFound, 'Service not found');
        }

        if (!service.is_active || service.is_deleted) {
            throw new HttpException(HttpStatus.BadRequest, 'Service is not available');
        }

        // Validate that service is administrative type
        if (service.type !== ServiceTypeEnum.ADMINISTRATIVE) {
            throw new HttpException(HttpStatus.BadRequest, 'Only administrative services can be reserved through this endpoint');
        }

        // Auto-populate fields from service if not provided
        const totalAmount = data.total_amount || service.price;
        const depositAmount = data.deposit_amount || Math.round(service.price * 0.2); // Default 20% deposit
        const collectionType = data.collection_type || TypeEnum.FACILITY; // Default to facility collection

        console.log('Reservation auto-population:', {
            servicePrice: service.price,
            providedTotalAmount: data.total_amount,
            finalTotalAmount: totalAmount,
            providedDepositAmount: data.deposit_amount,
            finalDepositAmount: depositAmount,
            providedCollectionType: data.collection_type,
            finalCollectionType: collectionType
        });

        // Calculate remaining amount
        const remainingAmount = totalAmount - depositAmount;

        // Set expiration time (24 hours from now)
        const reservationExpiresAt = new Date();
        reservationExpiresAt.setHours(reservationExpiresAt.getHours() + 24);

        const reservationData = {
            user_id: userId,
            service_id: data.service_id,
            reservation_type: ReservationTypeEnum.ADMINISTRATIVE_SERVICE,
            testing_need: data.testing_need,
            status: ReservationStatusEnum.PENDING,
            payment_status: PaymentStatusEnum.UNPAID,
            payment_type: ReservationPaymentTypeEnum.DEPOSIT,
            total_amount: totalAmount,
            deposit_amount: depositAmount,
            amount_paid: 0,
            remaining_amount: remainingAmount,
            preferred_appointment_date: data.preferred_appointment_date,
            preferred_time_slots: data.preferred_time_slots,
            collection_type: collectionType,
            collection_address: data.collection_address,
            contact_phone: data.contact_phone,
            contact_email: data.contact_email,
            special_requirements: data.special_requirements,
            notes: data.notes || [],
            reservation_expires_at: reservationExpiresAt,
            payment_history: [],
        };

        const reservation = await Reservation.create(reservationData);
        return reservation.toObject() as unknown as IReservation;
    }

    /**
     * Get reservation by ID
     */
    public async getReservationById(reservationId: string): Promise<IReservation | null> {
        const reservation = await Reservation.findById(reservationId)
            .populate('service_id')
            .populate('converted_to_appointment_id');

        return reservation ? reservation.toObject() as unknown as IReservation : null;
    }

    /**
     * Get reservations by user ID
     */
    public async getReservationsByUserId(userId: string): Promise<IReservation[]> {
        const reservations = await Reservation.find({ user_id: userId })
            .populate('service_id')
            .populate('converted_to_appointment_id')
            .sort({ created_at: -1 });

        return reservations.map(reservation => reservation.toObject() as unknown as IReservation);
    }

    /**
     * Get reservations by service ID (Admin/Manager/Staff only)
     */
    public async getReservationsByServiceId(serviceId: string): Promise<IReservation[]> {
        const reservations = await Reservation.find({ service_id: serviceId })
            .populate('user_id')
            .populate('service_id')
            .populate('converted_to_appointment_id')
            .sort({ created_at: -1 });

        return reservations.map(reservation => reservation.toObject() as unknown as IReservation);
    }

    /**
     * Get reservations by testing need (Admin/Manager/Staff only)
     */
    public async getReservationsByTestingNeed(testingNeed: TestingNeedEnum): Promise<IReservation[]> {
        const reservations = await Reservation.find({ testing_need: testingNeed })
            .populate('user_id')
            .populate('service_id')
            .populate('converted_to_appointment_id')
            .sort({ created_at: -1 });

        return reservations.map(reservation => reservation.toObject() as unknown as IReservation);
    }

    /**
     * Update reservation
     */
    public async updateReservation(reservationId: string, userId: string, data: IUpdateReservationRequest): Promise<IReservation | null> {
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            throw new HttpException(HttpStatus.NotFound, 'Reservation not found');
        }

        if (reservation.user_id.toString() !== userId) {
            throw new HttpException(HttpStatus.Forbidden, 'You can only update your own reservations');
        }

        if (reservation.status === ReservationStatusEnum.EXPIRED || reservation.status === ReservationStatusEnum.CANCELLED) {
            throw new HttpException(HttpStatus.BadRequest, 'Cannot update expired or cancelled reservation');
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(reservationId, data, { new: true })
            .populate('service_id');

        return updatedReservation ? updatedReservation.toObject() as unknown as IReservation : null;
    }

    /**
     * Cancel reservation
     */
    public async cancelReservation(reservationId: string, userId: string): Promise<IReservation | null> {
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            throw new HttpException(HttpStatus.NotFound, 'Reservation not found');
        }

        if (reservation.user_id.toString() !== userId) {
            throw new HttpException(HttpStatus.Forbidden, 'You can only cancel your own reservations');
        }

        if (reservation.status === ReservationStatusEnum.CANCELLED) {
            throw new HttpException(HttpStatus.BadRequest, 'Reservation is already cancelled');
        }

        if (reservation.status === ReservationStatusEnum.CONVERTED) {
            throw new HttpException(HttpStatus.BadRequest, 'Cannot cancel converted reservation');
        }

        const cancelledReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            { status: ReservationStatusEnum.CANCELLED },
            { new: true }
        );

        return cancelledReservation ? cancelledReservation.toObject() as unknown as IReservation : null;
    }

    /**
     * Process payment for reservation
     */
    public async processReservationPayment(userId: string, data: IReservationPaymentRequest): Promise<any> {
        const reservation = await Reservation.findById(data.reservation_id);
        if (!reservation) {
            throw new HttpException(HttpStatus.NotFound, 'Reservation not found');
        }

        if (reservation.user_id.toString() !== userId) {
            throw new HttpException(HttpStatus.Forbidden, 'You can only pay for your own reservations');
        }

        if (reservation.status === ReservationStatusEnum.EXPIRED || reservation.status === ReservationStatusEnum.CANCELLED) {
            throw new HttpException(HttpStatus.BadRequest, 'Cannot pay for expired or cancelled reservation');
        }

        // Validate payment amount
        if (data.payment_type === ReservationPaymentTypeEnum.DEPOSIT) {
            if (data.amount < reservation.deposit_amount) {
                throw new HttpException(HttpStatus.BadRequest, 'Deposit amount must be at least the required deposit');
            }
        } else if (data.payment_type === ReservationPaymentTypeEnum.FULL_PAYMENT) {
            if (data.amount < reservation.total_amount) {
                throw new HttpException(HttpStatus.BadRequest, 'Full payment amount must be at least the total amount');
            }
        }

        // Create payment record
        const paymentData = {
            user_id: userId,
            reservation_id: data.reservation_id,
            amount: data.amount,
            payment_method: data.payment_method,
            payment_type: this.mapPaymentType(data.payment_type),
            status: PaymentStatus.PENDING,
            reference_id: data.payment_reference || uuidv4(),
            description: `Payment for reservation ${reservation._id}`,
        };

        const payment = await PaymentSchema.create(paymentData);

        // Update reservation payment history
        const paymentHistoryEntry = {
            payment_id: payment._id,
            amount: data.amount,
            payment_date: new Date(),
            payment_method: data.payment_method,
            status: PaymentStatus.PENDING,
        };

        await Reservation.findByIdAndUpdate(
            data.reservation_id,
            {
                $push: { payment_history: paymentHistoryEntry },
                amount_paid: reservation.amount_paid + data.amount,
                remaining_amount: Math.max(0, reservation.total_amount - (reservation.amount_paid + data.amount)),
            }
        );

        return {
            payment,
            reservation: await this.getReservationById(data.reservation_id),
        };
    }

    /**
     * Convert reservation to appointment
     */
    public async convertReservationToAppointment(reservationId: string, userId: string): Promise<any> {
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            throw new HttpException(HttpStatus.NotFound, 'Reservation not found');
        }

        if (reservation.user_id.toString() !== userId) {
            throw new HttpException(HttpStatus.Forbidden, 'You can only convert your own reservations');
        }

        if (reservation.status !== ReservationStatusEnum.CONFIRMED) {
            throw new HttpException(HttpStatus.BadRequest, 'Reservation must be confirmed before converting to appointment');
        }

        if (reservation.payment_status !== PaymentStatusEnum.PAID) {
            throw new HttpException(HttpStatus.BadRequest, 'Reservation must be fully paid before converting to appointment');
        }

        // Create appointment from reservation
        const appointmentData = {
            user_id: reservation.user_id,
            service_id: reservation.service_id,
            appointment_date: reservation.preferred_appointment_date || new Date(),
            type: reservation.collection_type,
            collection_address: reservation.collection_address,
            status: AppointmentStatusEnum.PENDING,
            payment_status: PaymentStatusEnum.PAID,
            total_amount: reservation.total_amount,
            deposit_amount: reservation.deposit_amount,
            amount_paid: reservation.amount_paid,
            payment_stage: 'paid',
            notes: reservation.notes,
        };

        const Appointment = (await import('./appointment.model')).default;
        const appointment = await Appointment.create(appointmentData);

        // Update reservation status
        await Reservation.findByIdAndUpdate(
            reservationId,
            {
                status: ReservationStatusEnum.CONVERTED,
                converted_to_appointment_id: appointment._id,
            }
        );

        return {
            appointment,
            reservation: await this.getReservationById(reservationId),
        };
    }

    /**
     * Confirm reservation (Admin/Manager/Staff only)
     */
    public async confirmReservation(reservationId: string): Promise<IReservation | null> {
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            throw new HttpException(HttpStatus.NotFound, 'Reservation not found');
        }

        if (reservation.status !== ReservationStatusEnum.PENDING) {
            throw new HttpException(HttpStatus.BadRequest, 'Only pending reservations can be confirmed');
        }

        const confirmedReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            { status: ReservationStatusEnum.CONFIRMED },
            { new: true }
        ).populate('service_id');

        return confirmedReservation ? confirmedReservation.toObject() as unknown as IReservation : null;
    }

    /**
     * Check and expire old reservations
     */
    public async expireOldReservations(): Promise<void> {
        const now = new Date();
        await Reservation.updateMany(
            {
                status: ReservationStatusEnum.PENDING,
                reservation_expires_at: { $lt: now },
            },
            {
                status: ReservationStatusEnum.EXPIRED,
            }
        );
    }

    /**
     * Map reservation payment type to payment type
     */
    private mapPaymentType(reservationPaymentType: ReservationPaymentTypeEnum): PaymentTypeEnum {
        switch (reservationPaymentType) {
            case ReservationPaymentTypeEnum.DEPOSIT:
                return PaymentTypeEnum.RESERVATION_DEPOSIT;
            case ReservationPaymentTypeEnum.FULL_PAYMENT:
                return PaymentTypeEnum.RESERVATION_FULL_PAYMENT;
            case ReservationPaymentTypeEnum.PARTIAL_PAYMENT:
                return PaymentTypeEnum.RESERVATION_REMAINING;
            default:
                return PaymentTypeEnum.RESERVATION_DEPOSIT;
        }
    }
} 