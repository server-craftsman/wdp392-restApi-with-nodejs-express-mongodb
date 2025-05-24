import DepartmentSchema from './department.model';
import { IDepartment } from './department.interface';
import { Schema } from 'mongoose';

export default class DepartmentRepository {
    public async createDepartment(data: Partial<IDepartment>): Promise<IDepartment> {
        return DepartmentSchema.create(data);
    }

    public async findOne(query: any): Promise<IDepartment | null> {
        return DepartmentSchema.findOne(query);
    }

    public async findById(id: string): Promise<IDepartment | null> {
        return DepartmentSchema.findById(id);
    }

    public async findByIdAndUpdate(id: string, update: Partial<IDepartment>, options: any = {}): Promise<IDepartment | null> {
        return DepartmentSchema.findByIdAndUpdate(id, update, options);
    }

    public async countDocuments(query: any): Promise<number> {
        return DepartmentSchema.countDocuments(query);
    }

    public async find(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IDepartment[]> {
        return DepartmentSchema.find(query).sort(sort).skip(skip).limit(limit);
    }

    public async findAll(query: any): Promise<IDepartment[]> {
        return DepartmentSchema.find(query);
    }

    public async findByIdWithPopulate(id: string): Promise<IDepartment | null> {
        return DepartmentSchema.findById(id).populate('manager_id', 'first_name last_name email');
    }

    public async findWithPopulate(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IDepartment[]> {
        return DepartmentSchema.find(query).sort(sort).skip(skip).limit(limit).populate('manager_id', 'first_name last_name email');
    }
}
