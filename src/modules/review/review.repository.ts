import ReviewSchema from './review.model';
import { IReview } from './review.interface';
import { Types } from 'mongoose';

export const createReview = async (reviewData: Partial<IReview>) => {
    return await ReviewSchema.create(reviewData);
};

export const getReviewsByAppointment = async (appointmentId: string) => {
    return await ReviewSchema.find({ appointment_id: appointmentId, is_deleted: { $ne: true } });
};

export const getReviewById = async (id: string) => {
    return await ReviewSchema.findById(id);
};

export const updateReview = async (id: string, updateData: Partial<IReview>, customer_id: string) => {
    return await ReviewSchema.findOneAndUpdate(
        { _id: id, customer_id },
        updateData,
        { new: true }
    );
};

export const deleteReview = async (id: string) => {
    return await ReviewSchema.findByIdAndUpdate(id, { is_deleted: true }, { new: true });
};
