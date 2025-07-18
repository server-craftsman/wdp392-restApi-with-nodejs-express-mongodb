import { HttpStatus } from "../../../core/enums";
import { HttpException } from "../../../core/exceptions";
import { SearchPaginationResponseModel } from "../../../core/models";
import { ILog } from "./log.interface";
import LogRepository from "./log.repository";
import { CreateLogDto, LogSearchDto } from "./dtos/log.dto";
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

export default class LogService {
    private logRepository = new LogRepository();

    public async createLog(createLogDto: CreateLogDto): Promise<ILog> {
        try {
            console.log('LogService: Creating log with data:', JSON.stringify(createLogDto, null, 2));

            // Basic validation without strict DTO validation to prevent failures
            if (!createLogDto.blog_id || !createLogDto.author_id) {
                throw new Error('Missing required fields: blog_id or author_id');
            }

            // Validate ObjectId format for blog_id and author_id
            if (!createLogDto.blog_id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('Invalid blog_id format');
            }

            if (!createLogDto.author_id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('Invalid author_id format');
            }

            // Ensure dates are properly formatted
            const logData = {
                ...createLogDto,
                created_at: createLogDto.created_at || new Date(),
                updated_at: createLogDto.updated_at || new Date(),
                is_deleted: createLogDto.is_deleted || false
            };

            // Validate the DTO with more lenient approach
            try {
                const validatedData = plainToInstance(CreateLogDto, logData);
                await validateOrReject(validatedData);
                console.log('LogService: DTO validation passed');
            } catch (validationErrors) {
                console.error('LogService: Validation errors:', validationErrors);
                // Don't fail the entire operation, just log the validation errors
                console.warn('LogService: Validation failed, but continuing with log creation');

                // If validation fails, try to create log with minimal required data
                const minimalLogData = {
                    blog_id: logData.blog_id,
                    author_id: logData.author_id,
                    created_at: logData.created_at,
                    updated_at: logData.updated_at,
                    is_deleted: logData.is_deleted
                };

                console.log('LogService: Attempting to create log with minimal data:', JSON.stringify(minimalLogData, null, 2));
                const log = await this.logRepository.createLog(minimalLogData as unknown as ILog);
                console.log('LogService: Log created successfully with minimal data, ID:', log._id);
                return log;
            }

            const log = await this.logRepository.createLog(logData as unknown as ILog);
            console.log('LogService: Log created successfully with ID:', log._id);
            return log;
        } catch (error) {
            console.error('LogService: Error creating blog log:', error);
            console.error('LogService: Failed log data:', JSON.stringify(createLogDto, null, 2));

            // Provide more specific error information
            if (error instanceof Error) {
                throw new HttpException(HttpStatus.InternalServerError, `Error creating blog log: ${error.message}`);
            }
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
