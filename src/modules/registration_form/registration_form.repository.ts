import RegistrationFormSchema from './registration_form.model';
import { IRegistrationForm } from './registration_form.interface';

export default class RegistrationFormRepository {
    public async create(data: Partial<IRegistrationForm>): Promise<IRegistrationForm> {
        return RegistrationFormSchema.create(data);
    }

    public async findOne(query: any): Promise<IRegistrationForm | null> {
        return RegistrationFormSchema.findOne(query);
    }

    public async findById(id: string): Promise<IRegistrationForm | null> {
        return RegistrationFormSchema.findById(id);
    }

    public async findByIdAndUpdate(id: string, update: Partial<IRegistrationForm>, options: any = {}): Promise<IRegistrationForm | null> {
        return RegistrationFormSchema.findByIdAndUpdate(id, update, options);
    }

    public async countDocuments(query: any): Promise<number> {
        return RegistrationFormSchema.countDocuments(query);
    }

    public async find(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IRegistrationForm[]> {
        return RegistrationFormSchema.find(query).sort(sort).skip(skip).limit(limit);
    }

    public async findAll(query: any): Promise<IRegistrationForm[]> {
        return RegistrationFormSchema.find(query);
    }

    public async findWithPopulate(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IRegistrationForm[]> {
        return RegistrationFormSchema.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('sample_id');
    }

    public async findByIdWithPopulate(id: string): Promise<IRegistrationForm | null> {
        return RegistrationFormSchema.findById(id)
            .populate('sample_id');
    }

    public async findBySampleId(sampleId: string): Promise<IRegistrationForm | null> {
        return RegistrationFormSchema.findOne({ sample_id: sampleId })
            .populate('sample_id');
    }
} 