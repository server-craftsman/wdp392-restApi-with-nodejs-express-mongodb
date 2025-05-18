import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { UserGenders } from '../user/user.constant';
import { SampleTypes } from '../sample/sample.constant';
import { IRegistrationForm } from './registration-form.interface';

const RegistrationFormSchemaEntity: Schema<IRegistrationForm> = new Schema({
    sample_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.SAMPLE },
    patient_name: { type: String, required: true },
    gender: {
        type: String,
        enum: UserGenders,
        required: true
    },
    phone_number: { type: String, required: true },
    email: { type: String, required: true },
    sample_type: {
        type: String,
        enum: SampleTypes,
        required: true
    },
    relationship: { type: String, required: true },
    collection_date: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const RegistrationFormSchema = mongoose.model<IRegistrationForm & mongoose.Document>(
    COLLECTION_NAME.REGISTRATION_FORM,
    RegistrationFormSchemaEntity
);

export default RegistrationFormSchema; 