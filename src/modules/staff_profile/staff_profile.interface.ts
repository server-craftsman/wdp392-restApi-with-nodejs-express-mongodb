import { Document, Schema } from 'mongoose';
import { StaffStatusEnum } from './staff_profile.enum';

export type StaffStatus =
    StaffStatusEnum.ACTIVE |
    StaffStatusEnum.ON_LEAVE |
    StaffStatusEnum.TERMINATED;

export interface IQualification {
    name: string;
    institution: string;
    issue_date: Date;
    expiry_date?: Date;
    description?: string;
}

export interface IStaffProfile extends Document {
    _id: string;
    user_id: string | undefined;
    department_id: string | undefined;
    job_title: string;
    hire_date: Date;
    employee_id: string; //unique
    salary: number;
    status: StaffStatus;
    qualifications: IQualification[];
    created_at: Date;
    updated_at: Date;
} 