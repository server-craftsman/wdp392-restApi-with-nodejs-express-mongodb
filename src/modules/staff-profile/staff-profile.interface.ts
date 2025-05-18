import { Document, Schema } from 'mongoose';
import { StaffStatusEnum } from './staff-profile.enum';

export type StaffStatus =
    StaffStatusEnum.ACTIVE |
    StaffStatusEnum.ON_LEAVE |
    StaffStatusEnum.TERMINATED;

export interface IQualification {
    name: string;
    institution: string;
    issueDate: Date;
    expiryDate?: Date;
    description?: string;
}

export interface IStaffProfile extends Document {
    _id: string;
    user_id: Schema.Types.ObjectId;
    department_id: Schema.Types.ObjectId;
    job_title: string;
    hire_date: Date;
    employee_id: string;
    salary: number;
    status: StaffStatus;
    qualifications: IQualification[];
    created_at: Date;
    updated_at: Date;
} 