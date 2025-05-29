import ResultSchema from './result.model';
import { IResult } from './result.interface';

export default class ResultRepository {
    public async create(data: Partial<IResult>): Promise<IResult> {
        return ResultSchema.create(data);
    }

    public async findOne(query: any): Promise<IResult | null> {
        return ResultSchema.findOne(query);
    }

    public async findById(id: string): Promise<IResult | null> {
        return ResultSchema.findById(id);
    }

    public async findByIdAndUpdate(id: string, update: Partial<IResult>, options: any = {}): Promise<IResult | null> {
        return ResultSchema.findByIdAndUpdate(id, update, options);
    }

    public async countDocuments(query: any): Promise<number> {
        return ResultSchema.countDocuments(query);
    }

    public async find(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IResult[]> {
        return ResultSchema.find(query).sort(sort).skip(skip).limit(limit);
    }

    public async findAll(query: any): Promise<IResult[]> {
        return ResultSchema.find(query);
    }

    public async findWithPopulate(query: any, sort: any = {}, skip = 0, limit = 10): Promise<IResult[]> {
        return ResultSchema.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('sample_id')
            .populate('customer_id')
            .populate('appointment_id');
    }

    public async findByIdWithPopulate(id: string): Promise<IResult | null> {
        return ResultSchema.findById(id)
            .populate('sample_id')
            .populate('customer_id')
            .populate('appointment_id');
    }

    public async findBySampleId(sampleId: string): Promise<IResult | null> {
        return ResultSchema.findOne({ sample_id: sampleId })
            .populate('sample_id')
            .populate('customer_id')
            .populate('appointment_id');
    }

    public async findByAppointmentId(appointmentId: string): Promise<IResult | null> {
        return ResultSchema.findOne({ appointment_id: appointmentId })
            .populate('sample_id')
            .populate('customer_id')
            .populate('appointment_id');
    }
} 