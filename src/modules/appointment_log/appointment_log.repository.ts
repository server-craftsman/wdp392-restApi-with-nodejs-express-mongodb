import AppointmentLogSchema from './appointment_log.model';
import { IAppointmentLog } from './appointment_log.interface';

export default class AppointmentLogRepository {
    public async create(data: Partial<IAppointmentLog>): Promise<IAppointmentLog> {
        return AppointmentLogSchema.create(data);
    }

    public async findOne(query: any): Promise<IAppointmentLog | null> {
        return AppointmentLogSchema.findOne(query);
    }

    public async findById(id: string): Promise<IAppointmentLog | null> {
        return AppointmentLogSchema.findById(id);
    }

    public async findByIdAndUpdate(id: string, update: Partial<IAppointmentLog>, options: any = {}): Promise<IAppointmentLog | null> {
        return AppointmentLogSchema.findByIdAndUpdate(id, update, options) as Promise<IAppointmentLog | null>;
    }

    public async countDocuments(query: any): Promise<number> {
        return AppointmentLogSchema.countDocuments(query);
    }

    public async find(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IAppointmentLog[]> {
        return AppointmentLogSchema.find(query).sort(sort).skip(skip).limit(limit);
    }

    public async findAll(query: any): Promise<IAppointmentLog[]> {
        return AppointmentLogSchema.find(query);
    }

    public async findWithPopulate(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IAppointmentLog[]> {
        return AppointmentLogSchema.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('customer_id', '_id first_name last_name')
            .populate('staff_id', '_id first_name last_name')
            .populate('laboratory_technician_id', '_id first_name last_name')
            .populate('appointment_id');
    }

    public async findByIdWithPopulate(id: string): Promise<IAppointmentLog | null> {
        return AppointmentLogSchema.findById(id)
            .populate('customer_id', '_id first_name last_name')
            .populate('staff_id', '_id first_name last_name')
            .populate('laboratory_technician_id', '_id first_name last_name')
            .populate('appointment_id');
    }
} 