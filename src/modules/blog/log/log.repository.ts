import { ILog } from './log.interface';
import LogSchema from './log.model';

export default class LogRepository {
    public async createLog(model: ILog): Promise<ILog> {
        try {
            console.log('LogRepository: Creating log with model:', JSON.stringify(model, null, 2));

            // Validate required fields
            if (!model.blog_id) {
                throw new Error('blog_id is required');
            }
            if (!model.author_id) {
                throw new Error('author_id is required');
            }

            // Validate ObjectId format
            if (!model.blog_id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('Invalid blog_id format');
            }
            if (!model.author_id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('Invalid author_id format');
            }

            // Ensure required fields are present
            const logData = {
                blog_id: model.blog_id,
                author_id: model.author_id,
                created_at: model.created_at || new Date(),
                updated_at: model.updated_at || new Date(),
                is_deleted: model.is_deleted || false,
                // Only include optional fields if they exist
                ...(model.old_title !== undefined && { old_title: model.old_title }),
                ...(model.new_title !== undefined && { new_title: model.new_title }),
                ...(model.old_content !== undefined && { old_content: model.old_content }),
                ...(model.new_content !== undefined && { new_content: model.new_content }),
                ...(model.old_slug !== undefined && { old_slug: model.old_slug }),
                ...(model.new_slug !== undefined && { new_slug: model.new_slug }),
                ...(model.old_blog_category_id !== undefined && { old_blog_category_id: model.old_blog_category_id }),
                ...(model.new_blog_category_id !== undefined && { new_blog_category_id: model.new_blog_category_id }),
                ...(model.old_service_id !== undefined && { old_service_id: model.old_service_id }),
                ...(model.new_service_id !== undefined && { new_service_id: model.new_service_id }),
                ...(model.old_user_id !== undefined && { old_user_id: model.old_user_id }),
                ...(model.new_user_id !== undefined && { new_user_id: model.new_user_id }),
                ...(model.old_is_published !== undefined && { old_is_published: model.old_is_published }),
                ...(model.new_is_published !== undefined && { new_is_published: model.new_is_published }),
                ...(model.old_published_at !== undefined && { old_published_at: model.old_published_at }),
                ...(model.new_published_at !== undefined && { new_published_at: model.new_published_at }),
                ...(model.old_images !== undefined && { old_images: model.old_images }),
                ...(model.new_images !== undefined && { new_images: model.new_images }),
            };

            console.log('LogRepository: Final log data to save:', JSON.stringify(logData, null, 2));

            const log = await LogSchema.create(logData);
            console.log('LogRepository: Log created successfully with ID:', log._id);
            return log;
        } catch (error) {
            console.error('LogRepository: Error creating log:', error);

            // Provide more specific error information
            if (error instanceof Error) {
                throw new Error(`LogRepository error: ${error.message}`);
            }
            throw new Error('LogRepository: Unknown error occurred');
        }
    }

    public async getLogById(id: string): Promise<ILog | null> {
        return LogSchema.findById(id);
    }

    public async getLogsByBlogId(blogId: string): Promise<ILog[]> {
        return LogSchema.find({ blog_id: blogId }).sort({ created_at: -1 });
    }

    public async countLogs(query: any): Promise<number> {
        return LogSchema.countDocuments(query);
    }

    public async getLogsWithPagination(query: any, skip: number, limit: number): Promise<ILog[]> {
        return LogSchema.find(query).skip(skip).limit(limit).sort({ created_at: -1 });
    }
}
