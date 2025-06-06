import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { IBlog } from './blog.interface';
import BlogService from './blog.service';
import { BlogResponseDto, BlogSearchDto, CreateBlogDto, UpdateBlogDto } from './dtos/blog.dto';
import { ILog } from './log/log.interface';
import { LogService } from './log';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { formatResponse } from '../../core/utils';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';

// Define a type for the files object from multer's fields middleware
interface MulterFiles {
    [fieldname: string]: Express.Multer.File[];
}

class BlogController {
    private blogService = new BlogService();
    private logService = new LogService();

    public createBlog = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('Starting blog creation process...');
            const blogData = plainToInstance(CreateBlogDto, req.body);

            try {
                await validateOrReject(blogData);
            } catch (errors) {
                console.error('Validation errors:', errors);
                const validationErrors = errors as Array<{ property: string, constraints: Record<string, string> }>;
                const formattedErrors = validationErrors.map(error =>
                    Object.values(error.constraints || {}).join(', ')
                ).join('; ');
                throw new HttpException(HttpStatus.BadRequest, `Validation error: ${formattedErrors}`);
            }

            if (req.user && req.user.id) {
                blogData.user_id = req.user.id;
            } else {
                throw new HttpException(HttpStatus.Unauthorized, 'User authentication required');
            }

            // Handle boolean conversion for is_published if it's a string
            if (req.body.is_published !== undefined) {
                if (req.body.is_published === 'true') {
                    blogData.is_published = true;
                } else if (req.body.is_published === 'false') {
                    blogData.is_published = false;
                }
            }

            // Handle date conversion for published_at if it's a string
            if (req.body.published_at) {
                try {
                    const date = new Date(req.body.published_at);
                    // Check if the date is valid
                    if (isNaN(date.getTime())) {
                        console.error('Invalid date format for published_at:', req.body.published_at);
                        // Set to current date instead of invalid date
                        blogData.published_at = new Date();
                    } else {
                        blogData.published_at = date;
                    }
                } catch (error) {
                    console.error('Error converting published_at to Date:', error);
                    // Set to current date if conversion fails
                    blogData.published_at = new Date();
                }
            } else {
                // If no published_at provided, set to current date
                blogData.published_at = new Date();
            }

            // Add uploaded files to the DTO
            const files: Express.Multer.File[] = [];

            console.log('Checking for uploaded files...');
            if (req.files && typeof req.files === 'object') {
                console.log('Files found in request:', Object.keys(req.files));
                const multerFiles = req.files as MulterFiles;

                // Handle files from both 'images' and 'image_files' fields
                if (multerFiles['images'] && Array.isArray(multerFiles['images'])) {
                    console.log(`Found ${multerFiles['images'].length} files in 'images' field`);

                    // Validate each file to ensure it has the necessary properties
                    multerFiles['images'].forEach((file, index) => {
                        console.log(`Checking file ${index}:`, {
                            hasBuffer: !!file.buffer,
                            hasOriginalName: !!file.originalname,
                            hasMimetype: !!file.mimetype,
                            size: file.size
                        });

                        if (!file.buffer || !file.originalname || !file.mimetype) {
                            console.error('Invalid file object:', file);
                        } else {
                            files.push(file);
                        }
                    });
                }

                if (files.length > 0) {
                    console.log(`Adding ${files.length} valid files to blogData`);
                    blogData.files = files;
                } else {
                    console.log('No valid files found to upload');
                }
            } else {
                console.log('No files found in request');
            }

            // Check if required fields are present
            if (!blogData.service_id) {
                throw new HttpException(HttpStatus.BadRequest, 'service_id is required');
            }

            if (!blogData.blog_category_id) {
                throw new HttpException(HttpStatus.BadRequest, 'blog_category_id is required');
            }

            // save log in blog_logs collection
            console.log('Sending data to blog service for creation...');
            const blog: IBlog = await this.blogService.createBlog(blogData);
            console.log('Blog created successfully with ID:', blog._id);
            res.status(HttpStatus.Created).json(formatResponse<IBlog>(blog));
        } catch (error) {
            console.error('Controller error:', error);
            next(error);
        }
    };

    public updateBlog = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const blogId = req.params.id;
            const blogData = plainToInstance(UpdateBlogDto, req.body);

            try {
                await validateOrReject(blogData);
            } catch (errors) {
                console.error('Validation errors:', errors);
                const validationErrors = errors as Array<{ property: string, constraints: Record<string, string> }>;
                const formattedErrors = validationErrors.map(error =>
                    Object.values(error.constraints || {}).join(', ')
                ).join('; ');
                throw new HttpException(HttpStatus.BadRequest, `Validation error: ${formattedErrors}`);
            }

            // Handle boolean conversion for is_published if it's a string
            if (req.body.is_published !== undefined) {
                if (req.body.is_published === 'true') {
                    blogData.is_published = true;
                } else if (req.body.is_published === 'false') {
                    blogData.is_published = false;
                }
            }

            // Handle date conversion for published_at if it's a string
            if (req.body.published_at) {
                try {
                    const date = new Date(req.body.published_at);
                    // Check if the date is valid
                    if (isNaN(date.getTime())) {
                        console.error('Invalid date format for published_at:', req.body.published_at);
                        // Set to current date instead of invalid date
                        blogData.published_at = new Date();
                    } else {
                        blogData.published_at = date;
                    }
                } catch (error) {
                    console.error('Error converting published_at to Date:', error);
                    // Set to current date if conversion fails
                    blogData.published_at = new Date();
                }
            }

            // Process uploaded files
            // Note: If new files are uploaded, they will REPLACE existing images, not add to them
            const files: Express.Multer.File[] = [];

            if (req.files && typeof req.files === 'object') {
                console.log('Update blog: Processing uploaded files');
                const multerFiles = req.files as MulterFiles;

                // Handle files from 'images' field
                if (multerFiles['images'] && Array.isArray(multerFiles['images'])) {
                    console.log(`Update blog: Found ${multerFiles['images'].length} image files`);
                    // Validate each file to ensure it has the necessary properties
                    multerFiles['images'].forEach((file, index) => {
                        console.log(`Checking file ${index}:`, {
                            hasBuffer: !!file.buffer,
                            hasOriginalName: !!file.originalname,
                            hasMimetype: !!file.mimetype,
                            size: file.size
                        });

                        if (!file.buffer || !file.originalname || !file.mimetype) {
                            console.error('Invalid file object:', file);
                        } else {
                            files.push(file);
                        }
                    });
                }

                if (files.length > 0) {
                    console.log(`Update blog: Adding ${files.length} valid files to update request`);
                    blogData.files = files;
                } else {
                    console.log('Update blog: No valid files found to upload');
                }
            }

            // Extract user_id from JWT token for author tracking
            const authorId = req.user?.id || '';
            if (!authorId) {
                throw new HttpException(HttpStatus.Unauthorized, 'User authentication required');
            }

            console.log('Update blog: Sending update request to service');
            const blog: IBlog = await this.blogService.updateBlog(blogId, blogData, authorId);
            console.log('Update blog: Blog updated successfully');
            res.status(HttpStatus.Success).json(formatResponse<IBlog>(blog));
        } catch (error) {
            console.error('Controller error during update:', error);
            next(error);
        }
    };

    public uploadBlogImages = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const blogId = req.params.id;
            const files: Express.Multer.File[] = [];

            // Check if files were uploaded from either field
            if (req.files && typeof req.files === 'object') {
                const multerFiles = req.files as MulterFiles;

                if (multerFiles['images'] && Array.isArray(multerFiles['images'])) {
                    // Validate each file to ensure it has the necessary properties
                    multerFiles['images'].forEach(file => {
                        if (!file.buffer || !file.originalname || !file.mimetype) {
                            console.error('Invalid file object:', file);
                        } else {
                            files.push(file);
                        }
                    });
                }
            }

            if (files.length === 0) {
                return res.status(HttpStatus.BadRequest).json({
                    status: HttpStatus.BadRequest,
                    message: 'No files uploaded'
                });
            }

            // This method is used for standalone image uploads separate from blog creation/update
            // It follows the same process: uploads to S3 and automatically generates metadata
            const blog = await this.blogService.uploadBlogImages(blogId, files);

            res.status(HttpStatus.Success).json(formatResponse<IBlog>(blog));
        } catch (error) {
            console.error('Controller error during image upload:', error);
            next(error);
        }
    };

    public deleteBlogImage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const blogId = req.params.id;
            const imageUrl = req.body.image_url;

            if (!imageUrl) {
                throw new HttpException(HttpStatus.BadRequest, 'Image URL is required');
            }

            const isDeleted = await this.blogService.deleteBlogImage(blogId, imageUrl);
            if (isDeleted) {
                res.status(HttpStatus.Success).json(formatResponse<string>('Deleted blog image successfully!'));
            } else {
                throw new HttpException(HttpStatus.NotFound, 'Blog not found');
            }
        } catch (error) {
            next(error);
        }
    };

    public deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const blogId = req.params.id;
            const isDeleted = await this.blogService.deleteBlog(blogId);
            if (isDeleted) {
                res.status(HttpStatus.Success).json(formatResponse<string>('Deleted blog successfully!'));
            } else {
                throw new HttpException(HttpStatus.NotFound, 'Blog not found');
            }
        } catch (error) {
            next(error);
        }
    };

    public getBlogById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const blogId = req.params.id;
            const blog: IBlog = await this.blogService.getBlogById(blogId);
            res.status(HttpStatus.Success).json(formatResponse<IBlog>(blog));
        } catch (error) {
            next(error);
        }
    };

    public getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const slug = req.params.slug;
            const blog: IBlog = await this.blogService.getBlogBySlug(slug);
            res.status(HttpStatus.Success).json(formatResponse<IBlog>(blog));
        } catch (error) {
            next(error);
        }
    };

    public getBlogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('Controller: Fetching all blogs');
            const blogs: IBlog[] = await this.blogService.getBlogs();
            console.log(`Controller: Successfully fetched ${blogs.length} blogs`);
            res.status(HttpStatus.Success).json(formatResponse<IBlog[]>(blogs));
        } catch (error) {
            console.error('Controller error fetching blogs:', error);
            next(error);
        }
    };

    public searchBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check if there are any blogs in the database first
            try {
                const totalBlogsCount = await this.blogService.getTotalBlogsCount();
                console.log(`Controller: Total blogs in database: ${totalBlogsCount}`);

                if (totalBlogsCount === 0) {
                    console.log('Controller: No blogs found in database');
                    // If no blogs exist, return empty pagination result with correct structure
                    const emptyResult = new SearchPaginationResponseModel<IBlog>();
                    emptyResult.pageInfo.pageNum = 1;
                    emptyResult.pageInfo.pageSize = 10;
                    emptyResult.pageInfo.totalItems = 0;
                    emptyResult.pageInfo.totalPages = 0;
                    res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IBlog>>(emptyResult));
                    return;
                }
            } catch (error) {
                console.error('Controller: Error checking total blogs count:', error);
                // Continue with search even if this check fails
            }

            // Default search condition and pagination if not provided
            const searchCondition = req.body.searchCondition || {};
            console.log('Controller: Raw search condition:', JSON.stringify(searchCondition));

            // Initialize with empty object if searchCondition is null or undefined
            const searchData = plainToInstance(BlogSearchDto, searchCondition);

            try {
                // Skip validation if empty search condition (will return all blogs with pagination)
                if (Object.keys(searchCondition).length > 0) {
                    await validateOrReject(searchData);
                }
                console.log('Controller: Search data validation passed');
            } catch (validationErrors) {
                console.error('Controller: Search data validation failed:', validationErrors);
                // Extract specific validation error messages for better debugging
                const errorDetails = Array.isArray(validationErrors)
                    ? validationErrors.map(err => Object.values(err.constraints || {}).join(', ')).join('; ')
                    : 'Validation failed';

                throw new HttpException(HttpStatus.BadRequest, `Invalid search parameters: ${errorDetails}`);
            }

            // Ensure pageInfo has valid values
            const pageInfo = req.body.pageInfo || { pageNum: 1, pageSize: 10 };
            const pageNum = parseInt(pageInfo.pageNum) || 1;
            const pageSize = parseInt(pageInfo.pageSize) || 10;

            console.log(`Controller: Searching blogs with pageNum=${pageNum}, pageSize=${pageSize}`);
            console.log('Controller: Search conditions:', JSON.stringify(searchData));

            const searchResult = await this.blogService.searchBlogs(searchData, pageNum, pageSize);

            console.log(`Controller: Search completed, found ${searchResult.pageData.length} blogs`);
            console.log(`Controller: Total items: ${searchResult.pageInfo.totalItems}, Total pages: ${searchResult.pageInfo.totalPages}`);
            console.log('Controller: Search result structure:', JSON.stringify({
                hasPageData: !!searchResult.pageData,
                pageDataLength: searchResult.pageData?.length || 0,
                hasPageInfo: !!searchResult.pageInfo,
                pageInfoProps: searchResult.pageInfo ? Object.keys(searchResult.pageInfo) : []
            }));

            // Format the response exactly as the frontend expects it
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IBlog>>(searchResult));
        } catch (error) {
            console.error('Controller error during blog search:', error);
            next(error);
        }
    };

    public getBlogLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const blogId = req.params.id;
            const logs: ILog[] = await this.logService.getLogsByBlogId(blogId);
            res.status(HttpStatus.Success).json(formatResponse<ILog[]>(logs));
        } catch (error) {
            next(error);
        }
    };
}

export default BlogController;
