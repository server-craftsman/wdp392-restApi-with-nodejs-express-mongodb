import mongoose, { Schema } from 'mongoose';
import { IBlogCategory } from './blog_category.interface';
import { COLLECTION_NAME } from '../../core/constants/collection.constant';

const BlogCategorySchema: Schema<IBlogCategory> = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
});

export const BlogCategoryModel = mongoose.model<IBlogCategory>(COLLECTION_NAME.BLOG_CATEGORY, BlogCategorySchema);
