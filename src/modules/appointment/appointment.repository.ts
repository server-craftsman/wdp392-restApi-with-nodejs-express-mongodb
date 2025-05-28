import AppointmentSchema from './appointment.model';
import { IAppointment } from './appointment.interface';

export default class AppointmentRepository {
    public async create(data: Partial<IAppointment>): Promise<IAppointment> {
        return AppointmentSchema.create(data);
    }

    public async findOne(query: any): Promise<IAppointment | null> {
        return AppointmentSchema.findOne(query);
    }

    public async findById(id: string): Promise<IAppointment | null> {
        return AppointmentSchema.findById(id);
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
        return AppointmentSchema.find(query)
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
    }

    public async findByIdWithPopulate(id: string): Promise<IAppointment | null> {
        return AppointmentSchema.findById(id)
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
    }
}
