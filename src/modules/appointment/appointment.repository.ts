import AppointmentSchema from './appointment.model';
import { IAppointment } from './appointment.interface';
import SampleSchema from '../sample/sample.model';
import mongoose from 'mongoose';

export default class AppointmentRepository {
    public async create(data: Partial<IAppointment>): Promise<IAppointment> {
        return AppointmentSchema.create(data);
    }

    public async findOne(query: any): Promise<IAppointment | null> {
        return AppointmentSchema.findOne(query);
    }

    public async findById(id: string): Promise<IAppointment | null> {
        try {
            // Try to convert the ID to a valid ObjectId if it's not already
            const objectId = mongoose.Types.ObjectId.isValid(id)
                ? new mongoose.Types.ObjectId(id)
                : id;

            return AppointmentSchema.findById(objectId);
        } catch (error) {
            console.error(`Error finding appointment by ID ${id}:`, error);
            return null;
        }
    }

    public async findByIdAndUpdate(id: string, update: Partial<IAppointment>, options: any = {}): Promise<IAppointment | null> {
        return AppointmentSchema.findByIdAndUpdate(id, update, options);
    }

    public async countDocuments(query: any): Promise<number> {
        return AppointmentSchema.countDocuments(query);
    }

    public async find(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IAppointment[]> {
        return AppointmentSchema.find(query).sort(sort).skip(skip).limit(limit);
    }

    public async findAll(query: any): Promise<IAppointment[]> {
        return AppointmentSchema.find(query);
    }

    public async findWithPopulate(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IAppointment[]> {
        const appointments = await AppointmentSchema.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('user_id', '_id first_name last_name')
            .populate('service_id', '_id name')
            .populate('staff_id', '_id first_name last_name')
            .populate({
                path: 'slot_id',
                select: '_id start_time end_time',
                populate: {
                    path: 'staff_profile_ids',
                    select: '_id employee_id job_title',
                    populate: {
                        path: 'user_id',
                        select: '_id first_name last_name'
                    }
                }
            });

        // Find samples for all appointments in one query
        if (appointments && appointments.length > 0) {
            const appointmentIds = appointments.map(app => app._id);
            const allSamples = await SampleSchema.find({ appointment_id: { $in: appointmentIds } })
                .select('_id type status kit_id appointment_id')
                .populate('kit_id', '_id code');

            // Group samples by appointment ID
            const samplesByAppointment: Record<string, any[]> = {};
            allSamples.forEach(sample => {
                const appointmentId = sample.appointment_id.toString();
                if (!samplesByAppointment[appointmentId]) {
                    samplesByAppointment[appointmentId] = [];
                }
                samplesByAppointment[appointmentId].push(sample);
            });

            // Add samples to each appointment
            appointments.forEach(appointment => {
                const appointmentId = appointment._id.toString();
                if (samplesByAppointment[appointmentId]) {
                    (appointment as any).samples = samplesByAppointment[appointmentId];
                }
            });
        }

        return appointments;
    }

    public async findByIdWithPopulate(id: string): Promise<IAppointment | null> {
        const appointment = await AppointmentSchema.findById(id)
            .populate('user_id', '_id first_name last_name')
            .populate('service_id', '_id name')
            .populate('staff_id', '_id first_name last_name')
            .populate({
                path: 'slot_id',
                select: '_id start_time end_time',
                populate: {
                    path: 'staff_profile_ids',
                    select: '_id employee_id job_title',
                    populate: {
                        path: 'user_id',
                        select: '_id first_name last_name'
                    }
                }
            });

        if (appointment) {
            // Find samples associated with this appointment
            const samples = await SampleSchema.find({ appointment_id: appointment._id })
                .select('_id type status kit_id')
                .populate('kit_id', '_id code');

            // Add samples to the appointment object
            if (samples && samples.length > 0) {
                (appointment as any).samples = samples;
            }
        }

        return appointment;
    }
}
