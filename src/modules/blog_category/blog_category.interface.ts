import { Document, Schema } from 'mongoose';

export interface IBlogCategory extends Document {
    _id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}