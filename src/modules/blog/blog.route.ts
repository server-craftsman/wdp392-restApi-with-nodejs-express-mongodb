import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import multer from 'multer';
import { UserRoleEnum } from '../user/user.enum';
import BlogController from './blog.controller';
import { CreateBlogDto, UpdateBlogDto } from './dtos/blog.dto';

export default class BlogRoute implements IRoute {
    public path = API_PATH.BLOG;
    public router = Router();
    public blogController = new BlogController();

    // Configure multer for memory storage
    private storage = multer.memoryStorage();
    private upload = multer({
        storage: this.storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB max file size
        },
        fileFilter: (req, file, cb) => {
            // Accept only image files
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
                return cb(null, false);
            }
            cb(null, true);
        }
    });

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // POST: domain:/api/blog/create -> Create blog with image upload
        // Uses multer middleware to handle multipart/form-data form with image uploads
        this.router.post(
            `${this.path}/create`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.upload.fields([
                { name: 'images', maxCount: 10 }
            ]),
            validationMiddleware(CreateBlogDto, true),
            this.blogController.createBlog
        );

        // GET: domain:/api/blog/:id -> Get blog by id
        this.router.get(
            `${this.path}/:id`,
            this.blogController.getBlogById
        );

        // GET: domain:/api/blog/slug/:slug -> Get blog by slug
        this.router.get(
            `${this.path}/slug/:slug`,
            this.blogController.getBlogBySlug
        );

        // GET: domain:/api/blog -> Get all blogs
        this.router.get(
            `${this.path}`,
            this.blogController.getBlogs
        );

        // POST: domain:/api/blog/search -> Search blogs
        this.router.post(
            `${this.path}/search`,
            this.blogController.searchBlogs
        );

        // GET: domain:/api/blog/:id/logs -> Get blog logs
        this.router.get(
            `${this.path}/:id/logs`,
            this.blogController.getBlogLogs
        );

        // DELETE: domain:/api/blog/:id/image -> Delete image from blog
        this.router.delete(
            `${this.path}/:id/image`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.blogController.deleteBlogImage
        );

        // PUT: domain:/api/blog/:id -> Update blog with image upload
        // Uses multer middleware to handle multipart/form-data form with image uploads
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.upload.fields([
                { name: 'images', maxCount: 10 }
            ]),
            validationMiddleware(UpdateBlogDto, true),
            this.blogController.updateBlog
        );

        // DELETE: domain:/api/blog/:id -> Delete blog
        this.router.delete(
            `${this.path}/:id`,
            authMiddleWare([UserRoleEnum.ADMIN]),
            this.blogController.deleteBlog
        );
    }
}
