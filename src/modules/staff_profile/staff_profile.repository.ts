import StaffProfileSchema from './staff_profile.model';
import { IStaffProfile } from './staff_profile.interface';

export default class StaffProfileRepository {
    public async createStaffProfile(data: Partial<IStaffProfile>): Promise<IStaffProfile> {
        return StaffProfileSchema.create(data);
    }

    public async findOne(query: any): Promise<IStaffProfile | null> {
        return StaffProfileSchema.findOne(query);
    }

    public async findById(id: string): Promise<IStaffProfile | null> {
        return StaffProfileSchema.findById(id);
    }

    public async findByIdAndUpdate(id: string, update: Partial<IStaffProfile>, options: any = {}): Promise<IStaffProfile | null> {
        return StaffProfileSchema.findByIdAndUpdate(id, update, options);
    }

    public async countDocuments(query: any): Promise<number> {
        return StaffProfileSchema.countDocuments(query);
    }

    public async find(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IStaffProfile[]> {
        return StaffProfileSchema.find(query).sort(sort).skip(skip).limit(limit);
    }

    public async findAll(query: any): Promise<IStaffProfile[]> {
        return StaffProfileSchema.find(query);
    }

    public async findWithPopulate(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IStaffProfile[]> {
        return StaffProfileSchema.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('address', 'street ward district city country')
            .populate('user_id', 'first_name last_name email')
            .populate('department_id', 'name');
    }

    public async findByIdWithPopulate(id: string): Promise<IStaffProfile | null> {
        return StaffProfileSchema.findById(id)
            .populate('user_id', 'first_name last_name email')
            .populate('department_id', 'name');
    }
}
