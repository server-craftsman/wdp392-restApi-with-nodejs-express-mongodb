import ServiceSchema from './service.model';
import { IService, SampleMethod, ServiceType } from './service.interface';

export default class ServiceRepository {
    public async createService(data: Partial<IService>): Promise<IService> {
        return ServiceSchema.create(data);
    }

    public async findOne(query: any): Promise<IService | null> {
        return ServiceSchema.findOne(query);
    }

    public async findById(id: string): Promise<IService | null> {
        return ServiceSchema.findById(id).populate({
            path: 'parent_service_id',
            select: 'name'
        });
    }

    // find by id and populate parent service
    public async findByIdAndPopulateParentService(id: string): Promise<IService | null> {
        return ServiceSchema.findById(id).populate({
            path: 'parent_service_id',
            select: 'name'
        });
    }

    public async findByIdAndUpdate(id: string, update: Partial<IService>, options: any = {}): Promise<IService | null> {
        return ServiceSchema.findByIdAndUpdate(id, update, options);
    }

    public async countDocuments(query: any): Promise<number> {
        return ServiceSchema.countDocuments(query);
    }

    public async find(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IService[]> {
        return ServiceSchema.find(query).sort(sort).skip(skip).limit(limit).populate({
            path: 'parent_service_id',
            select: 'name'
        });
    }

    public async findAll(query: any): Promise<IService[]> {
        return ServiceSchema.find(query);
    }

    // find child services
    public async findChildServices(query: any): Promise<IService[]> {
        return ServiceSchema.find(query).populate({
            path: 'parent_service_id',
            select: 'name'
        });
    }
}
