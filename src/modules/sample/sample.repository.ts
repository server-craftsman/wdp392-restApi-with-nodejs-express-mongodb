import SampleSchema from './sample.model';
import { ISample } from './sample.interface';

export default class SampleRepository {
    public async create(data: Partial<ISample>): Promise<ISample> {
        return SampleSchema.create(data);
    }

    public async findOne(query: any): Promise<ISample | null> {
        return SampleSchema.findOne(query);
    }

    public async findById(id: string): Promise<ISample | null> {
        return SampleSchema.findById(id);
    }

    public async findByIdAndUpdate(id: string, update: Partial<ISample>, options: any = {}): Promise<ISample | null> {
        return SampleSchema.findByIdAndUpdate(id, update, options);
    }

    public async countDocuments(query: any): Promise<number> {
        return SampleSchema.countDocuments(query);
    }

    public async find(query: any, sort: any = {}, skip = 0, limit = 10): Promise<ISample[]> {
        return SampleSchema.find(query).sort(sort).skip(skip).limit(limit);
    }

    public async findAll(query: any): Promise<ISample[]> {
        return SampleSchema.find(query);
    }

    public async findWithPopulate(query: any, sort: any = {}, skip = 0, limit = 10): Promise<ISample[]> {
        return SampleSchema.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('appointment_id', '_id user_id service_id status appointment_date type collection_address staff_id slot_id created_at updated_at')
            .populate('kit_id', '_id code status created_at updated_at');
    }

    public async findByIdWithPopulate(id: string): Promise<ISample | null> {
        return SampleSchema.findById(id)
            .populate('appointment_id', '_id user_id service_id status appointment_date type collection_address staff_id slot_id created_at updated_at')
            .populate('kit_id', '_id code status created_at updated_at');
    }

    /**
     * Find samples by appointment ID with populated data
     */
    public async findByAppointmentId(appointmentId: string): Promise<ISample[]> {
        return SampleSchema.find({ appointment_id: appointmentId })
            .populate('appointment_id', '_id user_id service_id status appointment_date type collection_address staff_id slot_id payment_status created_at updated_at')
            .populate('kit_id', '_id code status created_at updated_at');
    }

    /**
     * Find multiple samples by their IDs with populated data
     * @param ids Array of sample IDs to find
     */
    public async findManyByIds(ids: string[]): Promise<ISample[]> {
        return SampleSchema.find({ _id: { $in: ids } })
            .populate('appointment_id', '_id user_id service_id status appointment_date type collection_address staff_id slot_id created_at updated_at')
            .populate('kit_id', '_id code status created_at updated_at');
    }
}
