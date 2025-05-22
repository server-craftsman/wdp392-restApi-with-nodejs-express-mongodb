import { Document, Schema } from 'mongoose';

export interface IBlogImage {
    name: string;
    image_url: string;
    created_at: Date;
}

export interface IBlog extends Document {
    _id: string;
    title: string;
    content: string;
    user_id: Schema.Types.ObjectId;
    is_published: boolean;
    published_at?: Date;
    images: IBlogImage[];
    created_at: Date;
    updated_at: Date;
} 