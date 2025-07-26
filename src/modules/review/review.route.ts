import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { UserRoleEnum } from '../user/user.enum';
import ReviewController from './review.controller';
import { CreateReviewDto, UpdateReviewDto } from './dtos';

export default class ReviewRoute implements IRoute {
    public path = API_PATH.REVIEW;
    public router = Router();
    private reviewController = new ReviewController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST: domain:/api/review -> Create a review
        this.router.post(`${this.path}`, authMiddleWare([UserRoleEnum.CUSTOMER]), validationMiddleware(CreateReviewDto), this.reviewController.createReview);

        // GET: domain:/api/review/appointment/:appointmentId -> Get reviews by appointment ID
        this.router.get(`${this.path}/appointment/:appointmentId`, authMiddleWare([UserRoleEnum.CUSTOMER]), this.reviewController.getReviewsByAppointmentId);

        // GET: domain:/api/review/:id -> Get review by ID
        this.router.get(`${this.path}/:id`, authMiddleWare([UserRoleEnum.CUSTOMER]), this.reviewController.getReviewById);

        // PUT: domain:/api/review/:id -> Update review
        this.router.put(`${this.path}/:id`, authMiddleWare([UserRoleEnum.CUSTOMER]), validationMiddleware(UpdateReviewDto), this.reviewController.updateReview);

        // DELETE: domain:/api/review/:id -> Delete review
        this.router.delete(`${this.path}/:id`, authMiddleWare([UserRoleEnum.CUSTOMER]), this.reviewController.deleteReview);
    }
}
