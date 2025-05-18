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
    sample_id: Schema.Types.ObjectId;
    is_match: boolean;
    result_data: IResultData;
    report_url: string;
    completed_at: Date;
    created_at: Date;
    updated_at: Date;
} 