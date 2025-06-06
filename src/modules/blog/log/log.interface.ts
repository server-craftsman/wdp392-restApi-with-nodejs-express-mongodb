import { Document, Schema } from "mongoose";
import { IBlogImage } from "../blog.interface";

export interface ILog extends Document {
    _id: string;
    blog_id: string;
    author_id: string;
    old_title: string;
    new_title: string;
    old_content: string;
    new_content: string;
    old_slug: string;
    new_slug: string;
    old_blog_category_id: string;
    new_blog_category_id: string;
    old_service_id: string;
    new_service_id: string;
    old_user_id: string;
    new_user_id: string;
    old_is_published: boolean;
    new_is_published: boolean;
    old_published_at: Date;
    new_published_at: Date;
    old_images: IBlogImage[];
    new_images: IBlogImage[];
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}
