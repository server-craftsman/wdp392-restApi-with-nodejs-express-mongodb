import KitSchema from './kit.model';
import { IKit } from './kit.interface';

export default class KitRepository {
    public async create(data: Partial<IKit>): Promise<IKit> {
        return await KitSchema.create(data);
    }

    public async findOne(query: any): Promise<IKit | null> {
        return KitSchema.findOne(query);
    }

    public async findById(id: string): Promise<IKit | null> {
        return KitSchema.findById(id);
    }

    public async findByIdAndUpdate(id: string, update: Partial<IKit>, options: any = {}): Promise<IKit | null> {
        return KitSchema.findByIdAndUpdate(id, update, options);
    }

    public async countDocuments(query: any): Promise<number> {
        return KitSchema.countDocuments(query);
    }

    public async find(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IKit[]> {
        return KitSchema.find(query).sort(sort).skip(skip).limit(limit);
    }

    public async findAll(query: any): Promise<IKit[]> {
        return KitSchema.find(query);
    }

    public async findWithPopulate(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IKit[]> {
        return KitSchema.find(query).sort(sort).skip(skip).limit(limit).populate('assigned_to_user_id', '_id first_name last_name');
    }

    public async findByIdWithPopulate(id: string): Promise<IKit | null> {
        return KitSchema.findById(id).populate('assigned_to_user_id', '_id first_name last_name');
    }

    public async findWithDetailedPopulate(query: any): Promise<IKit[]> {
        return KitSchema.find(query)
            .populate({
                path: 'assigned_to_user_id',
                select: '_id first_name last_name email role',
            });
    }
}
