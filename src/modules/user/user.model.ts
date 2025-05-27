import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { UserRoles, UserGenders } from './user.constant';
import { UserRoleEnum, UserGenderEnum } from './user.enum';
import { IUser } from './user.interface';

const UserSchemaEntity: Schema<IUser> = new Schema({
    email: { type: String, unique: true, index: true, required: true },
    password: { type: String },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    gender: {
        type: String,
        enum: UserGenders,
        default: UserGenderEnum.OTHER
    },
    google_id: { type: String },
    role: {
        type: String,
        enum: UserRoles,
        default: UserRoleEnum.CUSTOMER,
        required: true,
    },
    status: { type: Boolean, default: true },
    phone_number: { type: String, unique: true },
    avatar_url: { type: String },
    dob: { type: Date },
    address: { type: String },

    is_verified: { type: Boolean, default: false },
    verification_token: { type: String },
    verification_token_expires: { type: Date },
    token_version: { type: Number, default: 0 },

    // TODO: change to table
    // transactions: [
    //     {
    //         payout_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.PAYOUT, required: true },
    //         payout_no: { type: String },
    //         payout_amount: { type: Number },
    //         created_at: { type: Date, default: Date.now },
    //     },
    // ],

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

// Thêm virtual field vào UserSchema
UserSchemaEntity.virtual('staff_profile', {
    ref: 'StaffProfile',
    localField: '_id',
    foreignField: 'user_id',
    justOne: true
});

// Đảm bảo virtuals được bao gồm khi chuyển đổi sang JSON
UserSchemaEntity.set('toJSON', { virtuals: true });
UserSchemaEntity.set('toObject', { virtuals: true });

const UserSchema = mongoose.model<IUser & mongoose.Document>(COLLECTION_NAME.USER, UserSchemaEntity);
export default UserSchema;
