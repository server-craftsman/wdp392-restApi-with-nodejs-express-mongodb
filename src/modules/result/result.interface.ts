import { Document, Schema } from 'mongoose';
import { ResultMatchEnum } from './result.enum';

export type ResultMatch =
    ResultMatchEnum.MATCH |
    ResultMatchEnum.NO_MATCH |
    ResultMatchEnum.INCONCLUSIVE;

export interface IResultData {
    [key: string]: any;
}

export interface IResult extends Document {
    _id: string;
    sample_ids: string[] | undefined;
    customer_id: string | undefined;
    appointment_id: string | undefined;
    laboratory_technician_id: string | undefined;
    is_match: boolean;
    result_data: IResultData | null;
    report_url: string | null;
    completed_at: Date | null;
    created_at: Date;
    updated_at: Date;
} 