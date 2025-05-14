import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { UserRoles } from './user.constant';
import { UserRoleEnum } from './user.enum';
import { IUser } from './user.interface';

const UserSchemaEntity: Schema<IUser> = new Schema({
    email: { type: String, unique: true, index: true, required: true },
    password: { type: String },
    name: { type: String, required: true },
    google_id: { type: String },
    role: {
        type: String,
        enum: UserRoles,
        default: UserRoleEnum.STUDENT,
        required: true,
    },
    status: { type: Boolean, default: true },
    description: { type: String },
    phone_number: { type: String },
    avatar_url: { type: String },
    video_url: { type: String },
    dob: { type: Date, default: Date.now },

    is_verified: { type: Boolean, default: false },
    verification_token: { type: String },
    verification_token_expires: { type: Date },
    token_version: { type: Number },

    balance: { type: Number, default: 0 },
    balance_total: { type: Number, default: 0 },
    withdrawn_amount: { type: Number, defaults: 0 },
    bank_name: { type: String, default: '' },
    bank_account_no: { type: String, default: '' },
    bank_account_name: { type: String, default: '' },

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

const UserSchema = mongoose.model<IUser & mongoose.Document>(COLLECTION_NAME.USER, UserSchemaEntity);
export default UserSchema;
