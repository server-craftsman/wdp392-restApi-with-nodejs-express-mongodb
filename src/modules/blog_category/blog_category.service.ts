import mongoose, { Schema } from "mongoose";
import { IBlogCategory } from "./blog_category.interface";
import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
import { SearchPaginationResponseModel } from "../../core/models";
import { isEmptyObject } from "../../core/utils";
import { UserRoleEnum, UserSchema } from "../user";
import BlogCategoryRepository from "./blog_category.repository";
import { BlogCategorySearchDto, CreateBlogCategoryDto, UpdateBlogCategoryDto } from "./dtos/blog_category.dto";

export default class BlogCategoryService {
    private blogCategoryRepository = new BlogCategoryRepository();

    public async createBlogCategory(createBlogCategoryDto: CreateBlogCategoryDto): Promise<IBlogCategory> {
        try {
            const blogCategory = await this.blogCategoryRepository.createBlogCategory(createBlogCategoryDto as unknown as IBlogCategory);
            return blogCategory;
        } catch (error: any) {
            if (error.code === 11000) { // Duplicate key error
                throw new HttpException(HttpStatus.Conflict, 'Blog category with this name already exists');
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating blog category');
        }
    }

    public async updateBlogCategory(id: string, updateBlogCategoryDto: UpdateBlogCategoryDto): Promise<IBlogCategory> {
        try {
            const blogCategory = await this.blogCategoryRepository.updateBlogCategory(id, updateBlogCategoryDto as unknown as IBlogCategory);
            if (!blogCategory) {
                throw new HttpException(HttpStatus.NotFound, 'Blog category not found');
            }
            return blogCategory;
        } catch (error: any) {
            if (error instanceof HttpException) {
                throw error;
            }
            if (error.code === 11000) { // Duplicate key error
                throw new HttpException(HttpStatus.Conflict, 'Blog category with this name already exists');
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error updating blog category');
        }
    }

    public async deleteBlogCategory(id: string): Promise<IBlogCategory> {
        try {
            const blogCategory = await this.blogCategoryRepository.deleteBlogCategory(id);
            if (!blogCategory) {
                throw new HttpException(HttpStatus.NotFound, 'Blog category not found');
            }
            return blogCategory;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error deleting blog category');
        }
    }

    public async getBlogCategoryById(id: string): Promise<IBlogCategory> {
        try {
            const blogCategory = await this.blogCategoryRepository.getBlogCategoryById(id);
            if (!blogCategory) {
                throw new HttpException(HttpStatus.NotFound, 'Blog category not found');
            }
            return blogCategory;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching blog category');
        }
    }

    public async getBlogCategories(): Promise<IBlogCategory[]> {
        try {
            return await this.blogCategoryRepository.getBlogCategories();
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching blog categories');
        }
    }

    public async searchBlogCategories(searchParams: BlogCategorySearchDto, pageNum: number, pageSize: number): Promise<SearchPaginationResponseModel<IBlogCategory>> {
        try {
            const query: any = {};

            if (searchParams.name) {
                query.name = { $regex: searchParams.name, $options: 'i' };
            }

            const totalItems = await this.blogCategoryRepository.getBlogCategoriesWithPagination(query).then(categories => categories.length);
            const totalPages = Math.ceil(totalItems / pageSize);
            const skip = (pageNum - 1) * pageSize;

            const blogCategories = await this.blogCategoryRepository.getBlogCategoriesWithPagination(query)
                .then(categories => categories.slice(skip, skip + pageSize));

            return new SearchPaginationResponseModel<IBlogCategory>(
                blogCategories,
                {
                    pageNum,
                    pageSize,
                    totalItems,
                    totalPages
                }
            );
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error searching blog categories');
        }
    }
}

