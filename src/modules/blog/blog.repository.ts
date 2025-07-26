import { IBlog } from './blog.interface';
import BlogSchemaEntity from './blog.model';
import mongoose from 'mongoose';
import { BlogSearchDto } from './dtos/blog.dto';

export default class BlogRepository {
    public async createBlog(model: IBlog): Promise<IBlog> {
        try {
            return await BlogSchemaEntity.create(model);
        } catch (error) {
            console.error('Repository error creating blog:', error);
            throw error;
        }
    }

    public async updateBlog(id: string, model: Partial<IBlog>): Promise<IBlog | null> {
        try {
            console.log(`Repository: Updating blog ${id} with data:`, JSON.stringify(model));
            const blog = await BlogSchemaEntity.findByIdAndUpdate(id, { ...model, updated_at: new Date() }, { new: true });
            console.log(`Repository: Blog ${id} update result:`, blog ? 'Success' : 'Not found');
            return blog;
        } catch (error) {
            console.error(`Repository error updating blog ${id}:`, error);
            throw error;
        }
    }

    public async deleteBlog(id: string): Promise<IBlog | null> {
        return BlogSchemaEntity.findByIdAndUpdate(id, { is_deleted: true, updated_at: new Date() }, { new: true });
    }

    public async getBlogById(id: string): Promise<IBlog | null> {
        return BlogSchemaEntity.findById(id).where({ is_deleted: false });
    }

    public async getBlogBySlug(slug: string): Promise<IBlog | null> {
        return BlogSchemaEntity.findOne({ slug, is_deleted: false });
    }

    public async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
        const query: any = { slug, is_deleted: false };

        // If excludeId is provided, exclude that blog from the check
        // This is useful when updating a blog to check if the slug exists for any blog other than the current one
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const count = await BlogSchemaEntity.countDocuments(query);
        return count > 0;
    }

    public async getBlogs(): Promise<IBlog[]> {
        try {
            console.log('Repository: Fetching all non-deleted blogs');
            const blogs = await BlogSchemaEntity.find({ is_deleted: false }).populate('user_id', 'name email').populate('service_id', 'name').populate('blog_category_id', 'name').sort({ created_at: -1 });
            console.log(`Repository: Found ${blogs.length} blogs`);
            return blogs;
        } catch (error) {
            console.error('Repository error fetching blogs:', error);
            throw error;
        }
    }

    /**
     * Get the total count of non-deleted blogs in the database
     */
    public async getTotalBlogsCount(): Promise<number> {
        try {
            console.log('Repository: Counting all non-deleted blogs');
            const count = await BlogSchemaEntity.countDocuments({ is_deleted: false });
            console.log(`Repository: Total non-deleted blogs: ${count}`);
            return count;
        } catch (error) {
            console.error('Repository error counting all blogs:', error);
            throw error;
        }
    }

    public async searchBlogs(searchParams: BlogSearchDto): Promise<IBlog[]> {
        const query: any = { is_deleted: false };

        if (searchParams.title) {
            query.title = { $regex: searchParams.title, $options: 'i' };
        }

        if (searchParams.blog_category_id) {
            query.blog_category_id = searchParams.blog_category_id;
        }

        if (searchParams.user_id) {
            query.user_id = searchParams.user_id;
        }

        if (searchParams.service_id) {
            query.service_id = searchParams.service_id;
        }

        if (searchParams.is_published !== undefined) {
            query.is_published = searchParams.is_published;
        }

        return BlogSchemaEntity.find(query).populate('user_id', 'name email').populate('service_id', 'name').populate('blog_category_id', 'name');
    }

    public async countBlogs(searchParams: BlogSearchDto): Promise<number> {
        try {
            console.log('Repository: Counting blogs with search params:', JSON.stringify(searchParams));
            const query: any = { is_deleted: false };

            if (searchParams.title) {
                query.title = { $regex: searchParams.title, $options: 'i' };
            }

            // Build $or conditions for ID fields to handle potential schema inconsistencies
            const orConditions = [];

            if (searchParams.blog_category_id) {
                orConditions.push({ blog_category_id: searchParams.blog_category_id }, { blog_category_id: searchParams.blog_category_id.toString() });
            }

            if (searchParams.user_id) {
                orConditions.push({ user_id: searchParams.user_id }, { user_id: searchParams.user_id.toString() });
            }

            if (searchParams.service_id) {
                orConditions.push({ service_id: searchParams.service_id }, { service_id: searchParams.service_id.toString() });
            }

            // Add $or conditions to query if any exist
            if (orConditions.length > 0) {
                query.$or = orConditions;
            }

            if (searchParams.is_published !== undefined) {
                query.is_published = searchParams.is_published;
            }

            console.log('Repository: Final count query:', JSON.stringify(query));

            // First try with the specific query
            let count = await BlogSchemaEntity.countDocuments(query);
            console.log(`Repository: Found ${count} matching blogs with specific query`);

            // If no results and we have filters, try a fallback count of all non-deleted blogs
            if (count === 0 && Object.keys(query).length > 1) {
                const fallbackCount = await BlogSchemaEntity.countDocuments({ is_deleted: false });
                console.log(`Repository: Fallback count of all non-deleted blogs: ${fallbackCount}`);

                if (fallbackCount > 0) {
                    console.log('Repository: Using fallback count instead');
                    count = fallbackCount;
                }
            }

            return count;
        } catch (error) {
            console.error('Repository error counting blogs:', error);
            throw error;
        }
    }

    public async getBlogsWithPagination(query: any, skip: number, limit: number): Promise<IBlog[]> {
        try {
            console.log(`Repository: Getting paginated blogs with skip=${skip}, limit=${limit}`);
            console.log('Repository: Query:', JSON.stringify(query));

            // Ensure skip and limit are valid numbers
            const validSkip = Math.max(0, skip || 0);
            const validLimit = Math.max(1, Math.min(100, limit || 10));

            // Add explicit sorting to ensure consistent results
            const blogs = await BlogSchemaEntity.find(query)
                .skip(validSkip)
                .limit(validLimit)
                .sort({ created_at: -1 })
                .populate('user_id', 'fist_name last_name email')
                .populate('service_id', 'name')
                .populate('blog_category_id', 'name')
                .lean()
                .exec();

            // Ensure we always return an array
            const safeBlogs = Array.isArray(blogs) ? blogs : [];

            console.log(`Repository: Retrieved ${safeBlogs.length} blogs`);

            // Log a sample of the first blog for debugging (if available)
            if (safeBlogs.length > 0) {
                const sampleBlog = { ...safeBlogs[0] };
                if (sampleBlog.content && sampleBlog.content.length > 100) {
                    sampleBlog.content = sampleBlog.content.substring(0, 100) + '...';
                }
                console.log('Repository: Sample blog:', JSON.stringify(sampleBlog));
            } else {
                console.log('Repository: No blogs found with query:', JSON.stringify(query));

                // Debug: Try a simple query to check if any blogs exist
                const totalBlogsCount = await BlogSchemaEntity.countDocuments({ is_deleted: false });
                console.log(`Repository: Total non-deleted blogs in database: ${totalBlogsCount}`);

                if (totalBlogsCount > 0) {
                    // Get a sample blog to check schema
                    const sampleBlog = await BlogSchemaEntity.findOne({ is_deleted: false }).lean();
                    if (sampleBlog) {
                        console.log(
                            'Repository: Sample blog from database:',
                            JSON.stringify({
                                id: sampleBlog._id,
                                title: sampleBlog.title,
                                fields: Object.keys(sampleBlog),
                            }),
                        );
                    }
                }
            }

            return safeBlogs;
        } catch (error) {
            console.error('Repository error getting paginated blogs:', error);
            // Return empty array instead of throwing to prevent complete failure
            // The service layer can handle this appropriately
            return [];
        }
    }
}
