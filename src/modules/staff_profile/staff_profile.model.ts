import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { StaffStatuses } from './staff_profile.constant';
import { IStaffProfile } from './staff_profile.interface';
import { StaffStatusEnum } from './staff_profile.enum';
import { IAddress } from '../user/user.interface';

const QualificationSchema = new Schema({
    name: { type: String, required: true },
    institution: { type: String, required: true },
    issue_date: { type: Date, required: true },
    expiry_date: { type: Date },
    description: { type: String }
});

const AddressSchema = new Schema<IAddress>({
    street: { type: String, required: true },
    ward: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
});
const StaffProfileSchemaEntity: Schema<IStaffProfile> = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true, unique: true },
    department_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.DEPARTMENT, required: true },
    job_title: { type: String, required: true },
    hire_date: { type: Date, required: true },
    employee_id: { type: String, required: true, unique: true },
    salary: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        enum: StaffStatuses,
        required: true,
        default: StaffStatusEnum.ACTIVE
    },
    address: { type: AddressSchema, default: {} },
    qualifications: [QualificationSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const StaffProfileSchema = mongoose.model<IStaffProfile & mongoose.Document>(
    COLLECTION_NAME.STAFF_PROFILE,
    StaffProfileSchemaEntity
);

export default StaffProfileSchema; 