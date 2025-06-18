import { Document } from 'mongoose';
import { SampleMethodEnum, ServiceTypeEnum } from './service.enum';

export type ServiceType = ServiceTypeEnum.CIVIL | ServiceTypeEnum.ADMINISTRATIVE;
export type SampleMethod = SampleMethodEnum.SELF_COLLECTED | SampleMethodEnum.FACILITY_COLLECTED | SampleMethodEnum.HOME_COLLECTED;

export interface IService extends Document {
    _id: string;
    name: string;
    slug: string;
    description: string;
    parent_service_id?: string | null;
    type: ServiceType;
    // sample_method: SampleMethod;
    estimated_time: number; // in hours
    price: number;
    image_url?: string;
    is_active: boolean;
    is_deleted: boolean;
    created_at?: Date;
    updated_at?: Date;
    average_rating?: number;
    review_count?: number;
} 