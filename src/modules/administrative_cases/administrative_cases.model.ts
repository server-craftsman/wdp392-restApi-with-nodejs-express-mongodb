import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IAdministrativeCase } from './administrative_cases.interface';
import { AdministrativeCaseStatus } from './administrative_cases.enum';

const AdministrativeCaseSchemaEntity: Schema<IAdministrativeCase> = new Schema({
    case_number: { type: String, required: true, unique: true },
    authorization_code: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: Object.values(AdministrativeCaseStatus),
        required: true,
        default: AdministrativeCaseStatus.PENDING
    },
    agency_contact_email: { type: String, required: true },
    agency_contact_name: { type: String, required: true },
    // Store phone as string to preserve leading zeros and match DTO validation
    agency_contact_phone: { type: String, required: true },
    applicant_name: { type: String, required: true },
    applicant_email: { type: String, required: true },
    applicant_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false }
});

export const AdministrativeCaseSchema = mongoose.model<IAdministrativeCase>(COLLECTION_NAME.ADMINISTRATIVE_CASE, AdministrativeCaseSchemaEntity);

