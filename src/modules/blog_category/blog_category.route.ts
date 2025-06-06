import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import BlogCategoryController from './blog_category.controller';
import { CreateBlogCategoryDto, UpdateBlogCategoryDto } from './dtos/blog_category.dto';

export default class BlogCategoryRoute implements IRoute {
    public path = API_PATH.BLOG_CATEGORY;
    public router = Router();
    public blogCategoryController = new BlogCategoryController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(CreateBlogCategoryDto),
            this.blogCategoryController.createBlogCategory
        );

        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(UpdateBlogCategoryDto),
            this.blogCategoryController.updateBlogCategory
        );

        this.router.delete(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.blogCategoryController.deleteBlogCategory
        );

        this.router.get(
            `${this.path}/:id`,
            this.blogCategoryController.getBlogCategoryById
        );

        this.router.get(
            `${this.path}`,
            this.blogCategoryController.getBlogCategories
        );

        this.router.post(
            `${this.path}/search`,
            this.blogCategoryController.searchBlogCategories
        );
    }
}
