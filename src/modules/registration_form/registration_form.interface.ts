import { Document, Schema } from 'mongoose';
import { SampleTypeEnum } from '../sample/sample.enum';
import { UserGenderEnum } from '../user/user.enum';

export interface IRegistrationForm extends Document {
    _id: string;
    sample_id: string | undefined;
    patient_name: string;
    gender: UserGenderEnum;
    phone_number: string;
    email: string;
    sample_type: SampleTypeEnum;
    relationship: string;
    collection_date: Date;
    created_at: Date;
    updated_at: Date;
} 