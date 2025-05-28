import SlotSchema from './slot.model';
import { ISlot } from './slot.interface';

export default class SlotRepository {
    public async createSlot(data: Partial<ISlot>): Promise<ISlot> {
        return SlotSchema.create(data);
    }

    public async findOne(query: any): Promise<ISlot | null> {
        return SlotSchema.findOne(query);
    }

    public async findById(id: string): Promise<ISlot | null> {
        return SlotSchema.findById(id);
    }

    public async findByIdAndUpdate(id: string, update: Partial<ISlot>, options: any = {}): Promise<ISlot | null> {
        return SlotSchema.findByIdAndUpdate(id, update, options);
    }

    public async countDocuments(query: any): Promise<number> {
        return SlotSchema.countDocuments(query);
    }

    public async find(query: any, sort: any = {}, skip = 0, limit = 10): Promise<ISlot[]> {
        return SlotSchema.find(query).sort(sort).skip(skip).limit(limit);
    }

    public async findAll(query: any): Promise<ISlot[]> {
        return SlotSchema.find(query);
    }

    public async findWithPopulate(query: any, sort: any = {}, skip = 0, limit = 10): Promise<ISlot[]> {
        return SlotSchema.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'staff_profile_ids',
                select: 'employee_id job_title _id',
                populate: {
                    path: 'user_id',
                    select: '_id first_name last_name'
                }
            })
    }

    public async findByIdWithPopulate(id: string): Promise<ISlot | null> {
        return SlotSchema.findById(id)
            .populate({
                path: 'staff_profile_ids',
                select: 'employee_id job_title id',
                populate: {
                    path: 'user_id',
                    select: 'first_name last_name id'
                }
            })
    }
}
