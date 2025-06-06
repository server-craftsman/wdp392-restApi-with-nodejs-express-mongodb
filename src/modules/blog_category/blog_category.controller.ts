import { NextFunction, Request, Response, Router } from 'express';
import { HttpStatus } from '../../core/enums';
import { IBlogCategory } from './blog_category.interface';
import BlogCategoryService from './blog_category.service';
import { BlogCategoryResponseDto, BlogCategorySearchDto, CreateBlogCategoryDto, UpdateBlogCategoryDto } from './dtos/blog_category.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { formatResponse } from '../../core/utils';
import { SearchPaginationResponseModel } from '../../core/models';

class BlogCategoryController {
    private blogCategoryService = new BlogCategoryService();

    public createBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categoryData = plainToInstance(CreateBlogCategoryDto, req.body);
            await validateOrReject(categoryData);

            const blogCategory: IBlogCategory = await this.blogCategoryService.createBlogCategory(categoryData);
            res.status(HttpStatus.Created).json(formatResponse<IBlogCategory>(blogCategory));
        } catch (error) {
            next(error);
        }
    };

    public updateBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categoryId = req.params.id;
            const categoryData = plainToInstance(UpdateBlogCategoryDto, req.body);
            await validateOrReject(categoryData);

            const blogCategory: IBlogCategory = await this.blogCategoryService.updateBlogCategory(categoryId, categoryData);
            res.status(HttpStatus.Success).json(formatResponse<IBlogCategory>(blogCategory));
        } catch (error) {
            next(error);
        }
    };

    public deleteBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categoryId = req.params.id;
            const blogCategory: IBlogCategory = await this.blogCategoryService.deleteBlogCategory(categoryId);
            res.status(HttpStatus.Success).json(formatResponse<string>('Blog category deleted successfully'));
        } catch (error) {
            next(error);
        }
    };

    public getBlogCategoryById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categoryId = req.params.id;
            const blogCategory: IBlogCategory = await this.blogCategoryService.getBlogCategoryById(categoryId);
            res.status(HttpStatus.Success).json(formatResponse<IBlogCategory>(blogCategory));
        } catch (error) {
            next(error);
        }
    };

    public getBlogCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const blogCategories: IBlogCategory[] = await this.blogCategoryService.getBlogCategories();
            res.status(HttpStatus.Success).json(formatResponse<IBlogCategory[]>(blogCategories));
        } catch (error) {
            next(error);
        }
    };

    public searchBlogCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const searchData = plainToInstance(BlogCategorySearchDto, req.body.searchCondition || {});
            await validateOrReject(searchData);

            const pageInfo = req.body.pageInfo || { pageNum: 1, pageSize: 10 };
            const { pageNum, pageSize } = pageInfo;

            const searchResult = await this.blogCategoryService.searchBlogCategories(searchData, pageNum, pageSize);

            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IBlogCategory>>(searchResult));
        } catch (error) {
            next(error);
        }
    };

    public mapBlogCategoryToResponseDto(blogCategory: IBlogCategory): BlogCategoryResponseDto {
        return {
            id: blogCategory._id,
            name: blogCategory.name,
            created_at: blogCategory.created_at,
            updated_at: blogCategory.updated_at
        };
    }
}

export default BlogCategoryController;
