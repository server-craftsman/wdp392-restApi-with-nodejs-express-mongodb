import mongoose, { Schema } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';
import * as reviewRepository from './review.repository';
import { IReview } from './review.interface';
import { AppointmentSchema } from '../appointment';
import { ResultSchema } from '../result';
import { CreateReviewDto, UpdateReviewDto } from './dtos';
import UserSchema from '../user/user.model';
import { UserRoleEnum } from '../user/user.enum';
import ServiceSchema from '../service/service.model';
import { ServiceTypeEnum } from '../service/service.enum';

export default class ReviewService {
    private readonly reviewRepository: typeof reviewRepository;
    private readonly appointmentSchema: typeof AppointmentSchema;
    private readonly userSchema: typeof UserSchema;
    private readonly resultSchema: typeof ResultSchema;

    constructor() {
        this.reviewRepository = reviewRepository;
        this.appointmentSchema = AppointmentSchema;
        this.userSchema = UserSchema;
        this.resultSchema = ResultSchema;
    }

    /**
     * Create a review
     */
    public async createReview(user: any, reviewData: any): Promise<IReview> {
        try {
            // Check if a result exists for the appointment and customer
            const result = await this.resultSchema.findOne({
                appointment_id: reviewData.appointment_id,
                customer_id: reviewData.customer_id,
            });
            if (!result) {
                throw new HttpException(HttpStatus.NotFound, 'Result not found');
            }

            const service = await ServiceSchema.findById(reviewData.service_id);
            if (service && service.type === ServiceTypeEnum.ADMINISTRATIVE) {
                if (user.role !== UserRoleEnum.ADMIN && user.role !== UserRoleEnum.MANAGER) {
                    throw new Error('Only ADMIN or MANAGER can review ADMINISTRATIVE services');
                }
            }

            // Create the review
            const review = await this.reviewRepository.createReview(reviewData);
            return review;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating review');
        }
    }

    /**
     * Get reviews by appointment ID
     */
    public async getReviewsByAppointmentId(appointmentId: string): Promise<IReview[]> {
        try {
            const reviews = await this.reviewRepository.getReviewsByAppointment(appointmentId);
            return reviews;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting reviews');
        }
    }

    /**
     * Get review by ID
     */
    public async getReviewById(id: string): Promise<IReview> {
        try {
            const review = await this.reviewRepository.getReviewById(id);
            if (!review) {
                throw new HttpException(HttpStatus.NotFound, 'Review not found');
            }
            return review;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting review');
        }
    }

    /**
     * Update review
     */
    public async updateReview(updateData: UpdateReviewDto, id: string, customer_id: string): Promise<IReview> {
        try {
            const review = await this.reviewRepository.updateReview(id, updateData, customer_id);
            if (!review) {
                throw new HttpException(HttpStatus.NotFound, 'Review not found');
            }
            return review;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error updating review');
        }
    }

    /**
     * Delete review
     */
    public async deleteReview(id: string): Promise<IReview> {
        try {
            const review = await this.reviewRepository.deleteReview(id);
            if (!review) {
                throw new HttpException(HttpStatus.NotFound, 'Review not found');
            }
            return review;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error deleting review');
        }
    }
}
