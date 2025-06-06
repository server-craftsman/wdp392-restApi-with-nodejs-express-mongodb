import { ILog } from "./log.interface";
import LogSchema from "./log.model";

export default class LogRepository {
    public async createLog(model: ILog): Promise<ILog> {
        return LogSchema.create(model);
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
        return LogSchema.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ created_at: -1 });
    }
}
