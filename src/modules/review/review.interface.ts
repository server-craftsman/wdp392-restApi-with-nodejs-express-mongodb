import { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    _id: string;
    rating: number;
    comment: string;
    appointment_id: string | undefined;
    customer_id: string | undefined;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}
