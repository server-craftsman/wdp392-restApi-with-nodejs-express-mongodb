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
    slug: string;
    user_id: string | undefined;
    service_id: string | undefined;
    blog_category_id: string | undefined;
    is_published: boolean;
    published_at?: Date;
    images?: IBlogImage[];
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}
