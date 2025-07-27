import mongoose from 'mongoose';
import { IResult } from './result.interface';
import ResultSchema from './result.model';

export default class ResultRepository {
    /**
     * Create a new result
     */
    public async create(resultData: Partial<IResult>): Promise<IResult> {
        const newResult = new ResultSchema(resultData);
        return await newResult.save();
    }

    /**
     * Find result by ID
     */
    public async findById(id: string): Promise<IResult | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await ResultSchema.findById(id)
            .select('_id sample_ids customer_id appointment_id laboratory_technician_id is_match result_data report_url completed_at created_at updated_at')
            .exec();
    }

    /**
     * Find result by sample ID
     */
    public async findBySampleId(sampleId: string): Promise<IResult | null> {
        if (!mongoose.Types.ObjectId.isValid(sampleId)) {
            return null;
        }
        return await ResultSchema.findOne({ sample_ids: { $in: [sampleId] } })
            .select('_id sample_ids customer_id appointment_id laboratory_technician_id is_match result_data report_url completed_at created_at updated_at')
            .exec();
    }

    /**
     * Find one result by query
     */
    public async findOne(query: any): Promise<IResult | null> {
        return await ResultSchema.findOne(query)
            .select('_id sample_ids customer_id appointment_id laboratory_technician_id is_match result_data report_url completed_at created_at updated_at')
            .exec();
    }

    /**
     * Find results by query
     */
    public async find(query: any): Promise<IResult[]> {
        return await ResultSchema.find(query)
            .select('_id sample_ids customer_id appointment_id laboratory_technician_id is_match result_data report_url completed_at created_at updated_at')
            .exec();
    }

    /**
     * Update result by ID
     */
    public async findByIdAndUpdate(id: string, updateData: Partial<IResult>, options?: any): Promise<IResult | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await ResultSchema.findByIdAndUpdate(id, updateData, options).exec();
    }

    /**
     * Delete result by ID
     */
    public async findByIdAndDelete(id: string): Promise<IResult | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return await ResultSchema.findByIdAndDelete(id).exec();
    }

    public async countDocuments(query: any): Promise<number> {
        return ResultSchema.countDocuments(query);
    }

    public async findAll(query: any): Promise<IResult[]> {
        return ResultSchema.find(query)
            .select('_id sample_ids customer_id appointment_id laboratory_technician_id is_match result_data report_url completed_at created_at updated_at')
            .populate('sample_ids')
            .populate('customer_id')
            .populate('appointment_id');
    }

    /**
     * Find result by appointment ID with populated fields
     */
    public async findByAppointmentId(appointmentId: string): Promise<IResult | null> {
        return ResultSchema.findOne({ appointment_id: appointmentId })
            .select('_id sample_ids customer_id appointment_id laboratory_technician_id is_match result_data report_url completed_at created_at updated_at')
            .populate('sample_ids')
            .populate('customer_id')
            .populate('appointment_id')
            .populate('laboratory_technician_id');
    }
}
