import mongoose, { Schema } from 'mongoose';
import { ILog } from './log.interface';
import { COLLECTION_NAME } from '../../../core/constants';

const BlogImageSchema = new Schema({
    name: { type: String },
    image_url: { type: String },
    created_at: { type: Date, default: Date.now },
});

const LogSchemaEntity = new Schema({
    blog_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.BLOG },
    author_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
    old_title: { type: String },
    new_title: { type: String },
    old_content: { type: String },
    new_content: { type: String },
    old_slug: { type: String },
    new_slug: { type: String },
    old_blog_category_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.BLOG_CATEGORY },
    new_blog_category_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.BLOG_CATEGORY },
    old_service_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SERVICE },
    new_service_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SERVICE },
    old_user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
    new_user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER },
    old_is_published: { type: Boolean },
    new_is_published: { type: Boolean },
    old_published_at: { type: Date },
    new_published_at: { type: Date },
    old_images: [BlogImageSchema],
    new_images: [BlogImageSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const LogSchema = mongoose.model<ILog & mongoose.Document>(COLLECTION_NAME.BLOG_LOG, LogSchemaEntity);

export default LogSchema;
