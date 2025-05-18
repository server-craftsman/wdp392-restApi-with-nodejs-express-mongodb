import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IBlog } from './blog.interface';

const BlogImageSchema = new Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const BlogSchemaEntity: Schema<IBlog> = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    is_published: { type: Boolean, default: false },
    published_at: { type: Date },
    images: [BlogImageSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const BlogSchema = mongoose.model<IBlog & mongoose.Document>(
    COLLECTION_NAME.BLOG,
    BlogSchemaEntity
);

export default BlogSchema; 