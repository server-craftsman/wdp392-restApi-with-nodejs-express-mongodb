import { HttpStatus } from "../../../core/enums";
import { HttpException } from "../../../core/exceptions";
import { SearchPaginationResponseModel } from "../../../core/models";
import { ILog } from "./log.interface";
import LogRepository from "./log.repository";
import { CreateLogDto, LogSearchDto } from "./dtos/log.dto";

export default class LogService {
    private logRepository = new LogRepository();

    public async createLog(createLogDto: CreateLogDto): Promise<ILog> {
        try {
            const log = await this.logRepository.createLog(createLogDto as unknown as ILog);
            return log;
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating blog log');
        }
    }

    public async getLogsByBlogId(blogId: string): Promise<ILog[]> {
        try {
            return await this.logRepository.getLogsByBlogId(blogId);
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching blog logs');
        }
    }

    public async getLogById(id: string): Promise<ILog> {
        try {
            const log = await this.logRepository.getLogById(id);
            if (!log) {
                throw new HttpException(HttpStatus.NotFound, 'Blog log not found');
            }
            return log;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching blog log');
        }
    }

    public async searchLogs(searchParams: LogSearchDto, pageNum: number, pageSize: number): Promise<SearchPaginationResponseModel<ILog>> {
        try {
            const query: any = {};

            if (searchParams.blog_id) {
                query.blog_id = searchParams.blog_id;
            }

            if (searchParams.author_id) {
                query.author_id = searchParams.author_id;
            }

            if (searchParams.created_at_from || searchParams.created_at_to) {
                query.created_at = {};

                if (searchParams.created_at_from) {
                    query.created_at.$gte = searchParams.created_at_from;
                }

                if (searchParams.created_at_to) {
                    query.created_at.$lte = searchParams.created_at_to;
                }
            }

            const totalItems = await this.logRepository.countLogs(query);
            const totalPages = Math.ceil(totalItems / pageSize);
            const skip = (pageNum - 1) * pageSize;

            const logs = await this.logRepository.getLogsWithPagination(query, skip, pageSize);

            return new SearchPaginationResponseModel<ILog>(
                logs,
                {
                    pageNum,
                    pageSize,
                    totalItems,
                    totalPages
                }
            );
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error searching blog logs');
        }
    }
}
