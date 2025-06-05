import { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
    _id: string;
    name: string;
    description: string;
    manager_id: string | undefined;
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
} 