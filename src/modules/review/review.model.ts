import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IReview } from './review.interface';

const ReviewSchemaEntity: Schema<IReview> = new Schema({
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    appointment_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.APPOINTMENT, required: true },
    customer_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const ReviewSchema = mongoose.model<IReview & mongoose.Document>(COLLECTION_NAME.REVIEW, ReviewSchemaEntity);

export default ReviewSchema;
