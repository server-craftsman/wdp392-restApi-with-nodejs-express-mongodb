import AppointmentSchema from './appointment.model';
import { IAppointment } from './appointment.interface';
import SampleSchema from '../sample/sample.model';
import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';

export default class AppointmentRepository {
    private appointmentSchema = AppointmentSchema;

    public async create(data: Partial<IAppointment>): Promise<IAppointment> {
        return AppointmentSchema.create(data);
    }

    public async findOne(query: any): Promise<IAppointment | null> {
        return AppointmentSchema.findOne(query);
    }

    public async findById(id: string): Promise<IAppointment | null> {
        return AppointmentSchema.findById(id);
    }

    public async findByIdAndUpdate(id: string, updateData: Partial<IAppointment>, options?: any): Promise<IAppointment | null> {
        return AppointmentSchema.findByIdAndUpdate(id, updateData, options);
    }

    public async countDocuments(query: any): Promise<number> {
        return AppointmentSchema.countDocuments(query);
    }

    public async find(query: any): Promise<IAppointment[]> {
        return AppointmentSchema.find(query);
    }

    public async findAll(query: any): Promise<IAppointment[]> {
        return AppointmentSchema.find(query);
    }

    public async findWithPopulate(query: any): Promise<IAppointment[]> {
        return AppointmentSchema.find(query)
            .populate('user_id', 'first_name last_name email phone_number')
            .populate('service_id', 'name price')
            .populate('staff_id', 'first_name last_name email phone_number')
            .populate('slot_id')
            .populate('laboratory_technician_id', 'first_name last_name email phone_number');
    }

    public async findByIdWithPopulate(id: string): Promise<IAppointment | null> {
        return AppointmentSchema.findById(id)
            .populate('user_id', 'first_name last_name email phone_number')
            .populate('service_id', 'name price')
            .populate('staff_id', 'first_name last_name email phone_number')
            .populate('slot_id')
            .populate('administrative_case_id', 'case_number authorization_code agency_contact_email agency_contact_name agency_contact_phone')
            .populate('payment_status')
            .populate('laboratory_technician_id', 'first_name last_name email phone_number');
    }

    public async findWithPaginationAndPopulate(
        query: any,
        sort: any,
        skip: number,
        limit: number
    ): Promise<IAppointment[]> {
        return AppointmentSchema.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('user_id', 'first_name last_name email phone_number')
            .populate('service_id', 'name price type is_active estimated_time')
            .populate('staff_id', 'first_name last_name email phone_number')
            .populate('slot_id')
            .populate('laboratory_technician_id', 'first_name last_name email phone_number');
    }

    public async findByUserIdWithPagination(
        userId: string,
        skip: number,
        limit: number,
        sort: any = { created_at: -1 }
    ): Promise<IAppointment[]> {
        const appointments = await this.appointmentSchema.find({ user_id: userId })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('service_id', 'name price')
            .populate('staff_id', 'first_name last_name')
            .populate('slot_id')
            .populate('laboratory_technician_id', 'first_name last_name');
        return appointments;
    }

    public async findByStaffIdWithPagination(
        staffId: string,
        skip: number,
        limit: number,
        query: any = {},
        sort: any = { created_at: -1 }
    ): Promise<IAppointment[]> {
        const appointments = await this.appointmentSchema.find({
            staff_id: staffId,
            ...query
        })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('user_id', 'first_name last_name email phone_number')
            .populate('service_id', 'name price')
            .populate('slot_id');
        return appointments;
    }

    public async findByLabTechIdWithPagination(
        labTechId: string,
        skip: number,
        limit: number,
        query: any = {},
        sort: any = { created_at: -1 }
    ): Promise<IAppointment[]> {
        const appointments = await this.appointmentSchema.find({
            laboratory_technician_id: labTechId,
            ...query
        })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('user_id', 'first_name last_name email phone_number')
            .populate('service_id', 'name price')
            .populate('slot_id')
            .populate('staff_id', 'first_name last_name');
        return appointments;
    }

    public async countAppointmentsByStaffAndSlot(staffId: string, slotId: string): Promise<number> {
        return AppointmentSchema.countDocuments({
            staff_id: staffId,
            slot_id: slotId
        });
    }
}
