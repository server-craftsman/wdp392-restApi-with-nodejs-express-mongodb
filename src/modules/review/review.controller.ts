import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import { IReview } from './review.interface';
import ReviewService from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dtos';
import { UserRoleEnum } from '../user';
import { SearchPaginationResponseModel } from '../../core/models';

export default class ReviewController {
    private reviewService = new ReviewService();

    /**
     * Create a review
     */
    public createReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new HttpException(HttpStatus.Unauthorized, 'User not authenticated');
            }
            const reviewData: CreateReviewDto = req.body;
            // Set customer_id from the logged-in user
            const customer_id = req.user.id;
            const review = await this.reviewService.createReview(req.user, { customer_id, ...reviewData });
            res.status(HttpStatus.Created).json(formatResponse<IReview>(review));
        } catch (error) {
            next(error);
        }
    };
    /**
     * Get reviews by appointment ID
     */
    public getReviewsByAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const appointmentId = req.params.appointmentId;
            const reviews = await this.reviewService.getReviewsByAppointmentId(appointmentId);
            res.status(HttpStatus.Success).json(formatResponse<IReview[]>(reviews));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get review by ID
     */
    public getReviewById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reviewId = req.params.id;
            const review = await this.reviewService.getReviewById(reviewId);
            res.status(HttpStatus.Success).json(formatResponse<IReview>(review));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update review
     */
    public updateReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reviewId = req.params.id;
            const updateData: UpdateReviewDto = req.body;
            const customer_id = req.user.id;
            const review = await this.reviewService.updateReview(updateData, reviewId, customer_id);
            res.status(HttpStatus.Success).json(formatResponse<IReview>(review));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Delete review
     */
    public deleteReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reviewId = req.params.id;
            const review = await this.reviewService.deleteReview(reviewId);
            res.status(HttpStatus.Success).json(formatResponse<IReview>(review));
        } catch (error) {
            next(error);
        }
    };
}
