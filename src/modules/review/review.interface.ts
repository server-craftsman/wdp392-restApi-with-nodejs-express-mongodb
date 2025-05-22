import { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    _id: string;
    rating: number;
    comment: string;
    appointment_id: Schema.Types.ObjectId;
    customer_id: Schema.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
} 