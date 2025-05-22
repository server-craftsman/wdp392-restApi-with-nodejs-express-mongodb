import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { StaffStatuses } from './staff-profile.constant';
import { IStaffProfile } from './staff-profile.interface';

const QualificationSchema = new Schema({
    name: { type: String, required: true },
    institution: { type: String, required: true },
    issue_date: { type: Date, required: true },
    expiry_date: { type: Date },
    description: { type: String }
});

const StaffProfileSchemaEntity: Schema<IStaffProfile> = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true, unique: true },
    department_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.DEPARTMENT, required: true },
    job_title: { type: String, required: true },
    hire_date: { type: Date, required: true },
    employee_id: { type: String, required: true, unique: true },
    salary: { type: Number, required: true },
    status: {
        type: String,
        enum: StaffStatuses,
        required: true
    },
    qualifications: [QualificationSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const StaffProfileSchema = mongoose.model<IStaffProfile & mongoose.Document>(
    COLLECTION_NAME.STAFF_PROFILE,
    StaffProfileSchemaEntity
);

export default StaffProfileSchema; 