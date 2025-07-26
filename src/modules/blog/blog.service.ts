import { UserRoleEnum, UserSchema } from '../user';
import mongoose, { Schema } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';
import { isEmptyObject } from '../../core/utils';
import { IBlog, IBlogImage } from './blog.interface';
import BlogRepository from './blog.repository';
import { BlogSearchDto, CreateBlogDto, UpdateBlogDto } from './dtos/blog.dto';
import { ILog } from './log/log.interface';
import LogService from './log/log.service';
import { uploadMultipleFilesToS3, s3Folders } from '../../core/utils/s3Upload';

export default class BlogService {
    private blogRepository = new BlogRepository();
    private logService = new LogService();

    public async createBlog(createBlogDto: CreateBlogDto): Promise<IBlog> {
        try {
            console.log('Blog service: Starting blog creation...');

            // Validate user_id if provided
            if (createBlogDto.user_id && !createBlogDto.user_id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid user_id format');
            }

            // Validate service_id
            if (!createBlogDto.service_id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid service_id format');
            }

            // Validate blog_category_id
            if (!createBlogDto.blog_category_id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid blog_category_id format');
            }

            // Generate a unique slug based on the title if not provided
            if (!createBlogDto.slug) {
                createBlogDto.slug = await this.generateSlug(createBlogDto.title);
            } else {
                // If slug is provided, ensure it's unique
                createBlogDto.slug = await this.generateSlug(createBlogDto.slug);
            }

            // Set default values for is_published and published_at if not provided
            if (createBlogDto.is_published === undefined) {
                createBlogDto.is_published = true;
            }

            // Ensure published_at is a valid date
            if (!createBlogDto.published_at || isNaN(createBlogDto.published_at.getTime())) {
                createBlogDto.published_at = new Date();
            }

            // Handle file uploads if files are provided
            if (createBlogDto.files && createBlogDto.files.length > 0) {
                console.log(`Blog service: Processing ${createBlogDto.files.length} files for upload`);
                try {
                    // Create blog first to get the ID
                    console.log('Blog service: Creating blog in database...');
                    const blog = await this.blogRepository.createBlog(createBlogDto as unknown as IBlog);
                    console.log(`Blog service: Blog created with ID: ${blog._id}`);

                    try {
                        // Upload images to S3 - this will store files in the blog-images/[blog_id] folder
                        const blogFolder = s3Folders.blogImages;
                        console.log(`Blog service: Uploading files to S3 folder: ${blogFolder}/${blog._id}`);
                        const imageUrls = await uploadMultipleFilesToS3(createBlogDto.files, blog._id, blogFolder);
                        console.log(`Blog service: ${imageUrls.length} files uploaded successfully`);

                        // Create image objects with auto-generated metadata:
                        // - name: original filename from the uploaded file
                        // - image_url: AWS S3 URL returned from the upload function
                        // - created_at: current timestamp
                        const blogImages: IBlogImage[] = imageUrls.map((url, index) => ({
                            name: createBlogDto.files![index].originalname,
                            image_url: url,
                            created_at: new Date(),
                        }));
                        console.log('Blog service: Created image metadata objects:', blogImages);

                        // Update blog with images
                        console.log(`Blog service: Updating blog ${blog._id} with ${blogImages.length} images`);
                        const updatedBlog = await this.blogRepository.updateBlog(blog._id, {
                            images: blogImages,
                            updated_at: new Date(),
                        });
                        console.log('Blog service: Blog updated with images successfully');

                        return updatedBlog || blog;
                    } catch (uploadError) {
                        console.error('Error uploading images to S3:', uploadError);

                        // Even if image upload fails, return the blog without images
                        return blog;
                    }
                } catch (dbError) {
                    console.error('Error creating blog in database:', dbError);
                    throw dbError;
                }
            } else {
                // Create blog without images
                console.log('Blog service: No files to upload, creating blog without images');
                const blog = await this.blogRepository.createBlog(createBlogDto as unknown as IBlog);
                return blog;
            }
        } catch (error) {
            console.error('Blog creation error:', error);
            if (error instanceof mongoose.Error.ValidationError) {
                const errorMessages = Object.values(error.errors)
                    .map((err) => err.message)
                    .join(', ');
                throw new HttpException(HttpStatus.BadRequest, `Validation error: ${errorMessages}`);
            } else if (error instanceof mongoose.Error.CastError) {
                throw new HttpException(HttpStatus.BadRequest, `Invalid ID format: ${error.path}`);
            } else if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating blog');
        }
    }

    public async updateBlog(id: string, updateBlogDto: UpdateBlogDto, authorId: string): Promise<IBlog> {
        try {
            console.log(`Blog update: Starting update for blog ID ${id}`);
            console.log(`Blog update: Author ID: ${authorId}`);
            console.log(`Blog update: Update data:`, JSON.stringify(updateBlogDto, null, 2));

            // Validate authorId
            if (!authorId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid author ID format');
            }

            // Validate user_id if provided in update data
            if (updateBlogDto.user_id && !updateBlogDto.user_id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid user_id format');
            }

            // Validate service_id if provided
            if (updateBlogDto.service_id && !updateBlogDto.service_id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid service_id format');
            }

            // Validate blog_category_id if provided
            if (updateBlogDto.blog_category_id && !updateBlogDto.blog_category_id.match(/^[0-9a-fA-F]{24}$/)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid blog_category_id format');
            }

            console.log('Blog update: Validation passed, fetching existing blog...');
            const existingBlog = await this.blogRepository.getBlogById(id);
            if (!existingBlog) {
                throw new HttpException(HttpStatus.NotFound, 'Blog not found');
            }
            console.log('Blog update: Existing blog found:', existingBlog._id);

            // If slug is being updated, ensure it's unique
            if (updateBlogDto.slug && updateBlogDto.slug !== existingBlog.slug) {
                updateBlogDto.slug = await this.generateSlug(updateBlogDto.slug, id);
            }
            // If title is being updated but slug isn't, update the slug based on the new title
            else if (updateBlogDto.title && !updateBlogDto.slug && updateBlogDto.title !== existingBlog.title) {
                updateBlogDto.slug = await this.generateSlug(updateBlogDto.title, id);
            }

            // Ensure published_at is a valid date if provided
            if (updateBlogDto.published_at !== undefined) {
                if (!updateBlogDto.published_at || isNaN(updateBlogDto.published_at.getTime())) {
                    updateBlogDto.published_at = new Date();
                }
            }

            // Handle file uploads if files are provided
            if (updateBlogDto.files && updateBlogDto.files.length > 0) {
                console.log(`Blog update: Processing ${updateBlogDto.files.length} new image files`);
                try {
                    // Upload images to S3 - this will store files in the blog-images/[blog_id] folder
                    const blogFolder = s3Folders.blogImages;
                    const imageUrls = await uploadMultipleFilesToS3(updateBlogDto.files, id, blogFolder);

                    // Create image objects with auto-generated metadata:
                    // - name: original filename from the uploaded file
                    // - image_url: AWS S3 URL returned from the upload function
                    // - created_at: current timestamp
                    const blogImages: IBlogImage[] = imageUrls.map((url, index) => ({
                        name: updateBlogDto.files![index].originalname,
                        image_url: url,
                        created_at: new Date(),
                    }));

                    // Replace existing images with new ones instead of adding to them
                    // This fixes the bug where images accumulate on each update
                    updateBlogDto.images = blogImages;
                    console.log(`Blog update: Replacing existing images with ${blogImages.length} new images`);
                } catch (uploadError) {
                    console.error('Error uploading images to S3 during update:', uploadError);
                    // Continue with the update without changing images
                }
            } else if (updateBlogDto.images === undefined) {
                // If no new files are uploaded and images field is not explicitly set,
                // preserve the existing images
                updateBlogDto.images = existingBlog.images || [];
                console.log('Blog update: No new images provided, keeping existing images');
            }

            console.log('Blog update: About to create blog log...');
            // Create log entry for the update
            try {
                const logResult = await this.createBlogLog(existingBlog, updateBlogDto, authorId);
                if (logResult) {
                    console.log('Blog log created successfully');
                } else {
                    console.log('Blog log creation skipped or failed, but continuing with blog update');
                }
            } catch (logError) {
                console.error('Failed to create blog log, but continuing with blog update:', logError);
                // Don't let log creation failure prevent the blog update
            }

            console.log('Blog update: About to update blog in repository...');
            const updatedBlog = await this.blogRepository.updateBlog(id, updateBlogDto as Partial<IBlog>);
            if (!updatedBlog) {
                throw new HttpException(HttpStatus.NotFound, 'Blog not found');
            }
            console.log('Blog update: Blog updated successfully in repository');
            return updatedBlog;
        } catch (error) {
            console.error(`Blog update error for ID ${id}:`, error);
            if (error instanceof mongoose.Error.ValidationError) {
                const errorMessages = Object.values(error.errors)
                    .map((err) => err.message)
                    .join(', ');
                throw new HttpException(HttpStatus.BadRequest, `Validation error: ${errorMessages}`);
            } else if (error instanceof mongoose.Error.CastError) {
                throw new HttpException(HttpStatus.BadRequest, `Invalid ID format: ${error.path}`);
            } else if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error updating blog');
        }
    }

    /**
     * Uploads images to an existing blog
     * Note: This method is primarily used internally by the createBlog and updateBlog methods
     * It's not exposed as a separate API endpoint as image uploads are integrated directly into
     * the blog creation and update processes
     *
     * @param blogId The ID of the blog to upload images to
     * @param files The files to upload
     * @returns The updated blog with the new images
     */
    public async uploadBlogImages(blogId: string, files: Express.Multer.File[]): Promise<IBlog> {
        try {
            console.log(`uploadBlogImages: Processing ${files.length} files for blog ${blogId}`);

            // Check if blog exists
            const blog = await this.blogRepository.getBlogById(blogId);
            if (!blog) {
                throw new HttpException(HttpStatus.NotFound, 'Blog not found');
            }

            // Create a folder specific to this blog
            const blogFolder = s3Folders.blogImages;

            try {
                // Log file details for debugging
                files.forEach((file, index) => {
                    console.log(`File ${index} details:`, {
                        originalname: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size,
                        hasBuffer: !!file.buffer,
                        hasPath: !!file.path,
                    });
                });

                // Upload images to S3
                console.log(`Uploading files to S3 folder: ${blogFolder}/${blogId}`);
                const imageUrls = await uploadMultipleFilesToS3(files, blogId, blogFolder);
                console.log(`Successfully uploaded ${imageUrls.length} files to S3`);

                // Create image objects
                const blogImages: IBlogImage[] = imageUrls.map((url, index) => ({
                    name: files[index].originalname,
                    image_url: url,
                    created_at: new Date(),
                }));
                console.log('Created image metadata objects:', blogImages);

                // Replace existing images with new ones (not adding to them)
                console.log(`Replacing ${blog.images?.length || 0} existing images with ${blogImages.length} new images`);

                // Update blog with new images
                const updatedBlog = await this.blogRepository.updateBlog(blogId, {
                    images: blogImages, // Replace existing images
                    updated_at: new Date(),
                });

                if (!updatedBlog) {
                    throw new HttpException(HttpStatus.NotFound, 'Blog not found');
                }

                console.log('Blog successfully updated with new images');
                return updatedBlog;
            } catch (uploadError) {
                console.error('Error uploading images to S3:', uploadError);
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to upload files to S3');
            }
        } catch (error) {
            console.error(`Error in uploadBlogImages for blog ID ${blogId}:`, error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error uploading blog images');
        }
    }

    public async deleteBlogImage(blogId: string, imageUrl: string): Promise<boolean> {
        try {
            // Check if blog exists
            const blog = await this.blogRepository.getBlogById(blogId);
            if (!blog) {
                throw new HttpException(HttpStatus.NotFound, 'Blog not found');
            }

            // Check if blog has images
            if (!blog.images || blog.images.length === 0) {
                throw new HttpException(HttpStatus.NotFound, 'Blog has no images');
            }

            // Filter out the image to delete
            const updatedImages = blog.images.filter((image) => image.image_url !== imageUrl);

            // Check if image was found
            if (updatedImages.length === blog.images.length) {
                throw new HttpException(HttpStatus.NotFound, 'Image not found');
            }

            // Update blog with filtered images
            const updatedBlog = await this.blogRepository.updateBlog(blogId, {
                images: updatedImages,
                updated_at: new Date(),
            });

            if (!updatedBlog) {
                throw new HttpException(HttpStatus.NotFound, 'Blog not found');
            }

            return true;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error deleting blog image');
        }
    }

    public async deleteBlog(id: string): Promise<boolean> {
        try {
            const blog = await this.blogRepository.deleteBlog(id);
            if (!blog) {
                throw new HttpException(HttpStatus.NotFound, 'Blog not found');
            }
            return true;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error deleting blog');
        }
    }

    public async getBlogById(id: string): Promise<IBlog> {
        try {
            const blog = await this.blogRepository.getBlogById(id);
            if (!blog) {
                throw new HttpException(HttpStatus.NotFound, 'Blog not found');
            }
            return blog;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching blog');
        }
    }

    public async getBlogBySlug(slug: string): Promise<IBlog> {
        try {
            const blog = await this.blogRepository.getBlogBySlug(slug);
            if (!blog) {
                throw new HttpException(HttpStatus.NotFound, 'Blog not found');
            }
            return blog;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching blog by slug');
        }
    }

    public async getBlogs(): Promise<IBlog[]> {
        try {
            console.log('Blog service: Fetching all blogs');
            const blogs = await this.blogRepository.getBlogs();
            console.log(`Blog service: Successfully fetched ${blogs.length} blogs`);
            return blogs;
        } catch (error) {
            console.error('Error fetching blogs:', error);
            if (error instanceof mongoose.Error.ValidationError) {
                const errorMessages = Object.values(error.errors)
                    .map((err) => err.message)
                    .join(', ');
                throw new HttpException(HttpStatus.BadRequest, `Validation error: ${errorMessages}`);
            } else if (error instanceof mongoose.Error.CastError) {
                throw new HttpException(HttpStatus.BadRequest, `Invalid ID format: ${error.path}`);
            } else if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching blogs');
        }
    }

    /**
     * Get the total count of non-deleted blogs in the database
     * This is useful for quickly checking if there are any blogs before performing a search
     */
    public async getTotalBlogsCount(): Promise<number> {
        try {
            console.log('Blog service: Getting total blogs count');
            const count = await this.blogRepository.getTotalBlogsCount();
            console.log(`Blog service: Total blogs count: ${count}`);
            return count;
        } catch (error) {
            console.error('Error getting total blogs count:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting total blogs count');
        }
    }

    public async searchBlogs(searchParams: BlogSearchDto, pageNum: number, pageSize: number): Promise<SearchPaginationResponseModel<IBlog>> {
        try {
            const query: any = { is_deleted: false };

            if (searchParams.title) {
                query.title = { $regex: searchParams.title, $options: 'i' };
            }

            // Simply use the ID strings directly without ObjectId conversion
            if (searchParams.blog_category_id) {
                // Try both formats (string and ObjectId) to handle potential schema inconsistencies
                query.$or = [{ blog_category_id: searchParams.blog_category_id }, { blog_category_id: searchParams.blog_category_id.toString() }];
            }

            if (searchParams.user_id) {
                if (!query.$or) query.$or = [];
                query.$or.push({ user_id: searchParams.user_id }, { user_id: searchParams.user_id.toString() });
            }

            if (searchParams.service_id) {
                if (!query.$or) query.$or = [];
                query.$or.push({ service_id: searchParams.service_id }, { service_id: searchParams.service_id.toString() });
            }

            if (searchParams.is_published !== undefined) {
                query.is_published = searchParams.is_published;
            }

            // Count total items matching the query
            const totalItems = await this.blogRepository.countBlogs(searchParams);
            // Ensure pagination values are valid numbers
            const validPageNum = Math.max(1, pageNum || 1);
            const validPageSize = Math.max(1, Math.min(100, pageSize || 10)); // Limit max page size to 100

            // Calculate pagination values
            const totalPages = Math.ceil(totalItems / validPageSize);
            const skip = (validPageNum - 1) * validPageSize;

            // Get paginated results
            const blogs = await this.blogRepository.getBlogsWithPagination(query, skip, validPageSize);
            // If no blogs found with the query, try a fallback query to get any blogs
            if (blogs.length === 0 && Object.keys(query).length > 1) {
                console.log('Blog service: No blogs found with specific query, trying fallback query');
                const fallbackQuery = { is_deleted: false };
                const fallbackBlogs = await this.blogRepository.getBlogsWithPagination(fallbackQuery, 0, validPageSize);

                if (fallbackBlogs.length > 0) {
                    // Use the fallback blogs but keep original pagination info
                    return new SearchPaginationResponseModel<IBlog>(fallbackBlogs, {
                        pageNum: validPageNum,
                        pageSize: validPageSize,
                        totalItems,
                        totalPages,
                    });
                }
            }

            // Ensure blogs is always an array
            const safeBlogs = Array.isArray(blogs) ? blogs : [];

            // Create and return the search pagination response with proper structure
            const response = new SearchPaginationResponseModel<IBlog>(safeBlogs, {
                pageNum: validPageNum,
                pageSize: validPageSize,
                totalItems,
                totalPages,
            });
            return response;
        } catch (error) {
            console.error('Error searching blogs:', error);
            if (error instanceof HttpException) {
                throw error;
            } else if (error instanceof mongoose.Error.ValidationError) {
                const errorMessages = Object.values(error.errors)
                    .map((err) => err.message)
                    .join(', ');
                throw new HttpException(HttpStatus.BadRequest, `Validation error: ${errorMessages}`);
            } else if (error instanceof mongoose.Error.CastError) {
                throw new HttpException(HttpStatus.BadRequest, `Invalid ID format: ${error.path}`);
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error searching blogs');
        }
    }

    /**
     * Generates a unique slug based on the provided text
     * @param text The text to generate a slug from
     * @param excludeId Optional blog ID to exclude from uniqueness check
     * @returns A unique slug
     */
    public async generateSlug(text: string, excludeId?: string): Promise<string> {
        // Convert to lowercase, replace spaces and special chars with hyphens
        let slug = text
            .toLowerCase()
            .trim()
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/đ/g, 'd');

        // Then handle spaces and special characters
        slug = slug
            .replace(/[^\w\s-]/g, '') // Xóa các ký tự không phải là từ ngoại trừ khoảng trắng và dấu gạch nối
            .replace(/[\s_]+/g, '-') // Thay thế khoảng trắng và dấu gạch dưới bằng dấu gạch nối
            .replace(/-+/g, '-') // Xóa các dấu gạch nối liên tiếp
            .replace(/^-+|-+$/g, ''); // Xóa các dấu gạch nối ở đầu và cuối chuỗi

        // Check if the slug already exists
        let isSlugExists = await this.blogRepository.checkSlugExists(slug, excludeId);
        let counter = 1;

        // If slug exists, append a number until we find a unique slug
        const originalSlug = slug;
        while (isSlugExists) {
            slug = `${originalSlug}-${counter}`;
            isSlugExists = await this.blogRepository.checkSlugExists(slug, excludeId);
            counter++;
        }

        return slug;
    }

    private async createBlogLog(oldBlog: IBlog, updateData: UpdateBlogDto, authorId: string): Promise<ILog | null> {
        try {
            // Create base log data with required fields
            const logData: any = {
                blog_id: oldBlog._id,
                author_id: authorId,
                created_at: new Date(),
                updated_at: new Date(),
                is_deleted: false,
            };

            // Track if any fields are actually being updated
            let hasUpdates = false;

            // Only log fields that are being updated
            if (updateData.title !== undefined) {
                logData.old_title = oldBlog.title || '';
                logData.new_title = updateData.title;
                hasUpdates = true;
            }

            if (updateData.content !== undefined) {
                logData.old_content = oldBlog.content || '';
                logData.new_content = updateData.content;
                hasUpdates = true;
            }

            if (updateData.slug !== undefined) {
                logData.old_slug = oldBlog.slug || '';
                logData.new_slug = updateData.slug;
                hasUpdates = true;
            }

            if (updateData.blog_category_id !== undefined) {
                logData.old_blog_category_id = oldBlog.blog_category_id || '';
                logData.new_blog_category_id = updateData.blog_category_id;
                hasUpdates = true;
            }

            if (updateData.service_id !== undefined) {
                logData.old_service_id = oldBlog.service_id || '';
                logData.new_service_id = updateData.service_id;
                hasUpdates = true;
            }

            if (updateData.user_id !== undefined) {
                logData.old_user_id = oldBlog.user_id || '';
                logData.new_user_id = updateData.user_id;
                hasUpdates = true;
            }

            if (updateData.is_published !== undefined) {
                logData.old_is_published = oldBlog.is_published;
                logData.new_is_published = updateData.is_published;
                hasUpdates = true;
            }

            if (updateData.published_at !== undefined) {
                logData.old_published_at = oldBlog.published_at || new Date();
                logData.new_published_at = updateData.published_at;
                hasUpdates = true;
            }

            if (updateData.images !== undefined) {
                // Ensure images have proper structure for validation
                logData.old_images = (oldBlog.images || []).map((img) => ({
                    name: img.name || '',
                    image_url: img.image_url || '',
                    created_at: img.created_at || new Date(),
                }));
                logData.new_images = (updateData.images || []).map((img) => ({
                    name: img.name || '',
                    image_url: img.image_url || '',
                    created_at: img.created_at || new Date(),
                }));
                hasUpdates = true;
            }

            // Only create log if there are actual updates
            if (!hasUpdates) {
                console.log('No fields updated, skipping log creation');
                return null; // Return null instead of throwing error
            }

            // Validate that required fields are present
            if (!logData.blog_id || !logData.author_id) {
                console.error('Missing required fields for log creation:', { blog_id: logData.blog_id, author_id: logData.author_id });
                return null; // Return null instead of throwing error
            }

            console.log('Creating blog log with data:', JSON.stringify(logData, null, 2));
            return await this.logService.createLog(logData);
        } catch (error) {
            console.error('Error in createBlogLog:', error);
            // Don't throw the error to prevent the entire update from failing
            // Just log it and continue with the blog update
            console.warn('Blog log creation failed, but continuing with blog update');
            return null; // Return null to indicate log creation failed
        }
    }
}
