import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IBlog } from './blog.interface';

const BlogImageSchema = new Schema({
    name: { type: String, required: true },
    image_url: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
});

const BlogSchemaEntity: Schema<IBlog> = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    service_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SERVICE, required: true },
    blog_category_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.BLOG_CATEGORY, required: true },
    is_published: { type: Boolean, default: true },
    published_at: { type: Date, default: Date.now },
    images: [BlogImageSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const BlogSchema = mongoose.model<IBlog & mongoose.Document>(COLLECTION_NAME.BLOG, BlogSchemaEntity);

export default BlogSchema;
