import mongoose from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IRegistrationForm } from './registration_form.interface';
import RegistrationFormRepository from './registration_form.repository';
import { CreateRegistrationFormDto } from './dtos/createRegistrationForm.dto';
import { UpdateRegistrationFormDto } from './dtos/updateRegistrationForm.dto';
import SampleService from '../sample/sample.service';
import { UserGenderEnum } from '../user/user.enum';
import { SampleTypeEnum } from '../sample/sample.enum';

export default class RegistrationFormService {
    private registrationFormRepository = new RegistrationFormRepository();
    private sampleService = new SampleService();

    /**
     * Create a new registration form
     */
    public async createRegistrationForm(formData: CreateRegistrationFormDto, laboratoryTechnicianId: string): Promise<IRegistrationForm> {
        try {
            // Validate sampleId
            if (!mongoose.Types.ObjectId.isValid(formData.sample_id)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid sample ID');
            }

            // Check if sample exists
            const sample = await this.sampleService.getSampleById(formData.sample_id);
            if (!sample) {
                throw new HttpException(HttpStatus.NotFound, 'Sample not found');
            }

            // Check if registration form already exists for this sample
            const existingForm = await this.registrationFormRepository.findBySampleId(formData.sample_id);
            if (existingForm) {
                throw new HttpException(
                    HttpStatus.Conflict,
                    'A registration form already exists for this sample'
                );
            }

            // Create the registration form
            const registrationForm = await this.registrationFormRepository.create({
                sample_id: formData.sample_id as any,
                patient_name: formData.patient_name,
                gender: formData.gender as UserGenderEnum,
                phone_number: formData.phone_number || '',
                email: formData.email || '',
                sample_type: formData.sample_type as SampleTypeEnum,
                relationship: formData.relationship,
                collection_date: new Date(formData.collection_date),
                created_at: new Date(),
                updated_at: new Date()
            });

            return registrationForm;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating registration form');
        }
    }

    /**
     * Update an existing registration form
     */
    public async updateRegistrationForm(formId: string, updateData: UpdateRegistrationFormDto, laboratoryTechnicianId: string): Promise<IRegistrationForm> {
        try {
            // Validate formId
            if (!mongoose.Types.ObjectId.isValid(formId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid registration form ID');
            }

            // Check if form exists
            const form = await this.registrationFormRepository.findById(formId);
            if (!form) {
                throw new HttpException(HttpStatus.NotFound, 'Registration form not found');
            }

            // Prepare update data
            const updateFields: Partial<IRegistrationForm> = {
                patient_name: updateData.patient_name,
                gender: updateData.gender as UserGenderEnum,
                phone_number: updateData.phone_number,
                email: updateData.email,
                sample_type: updateData.sample_type as SampleTypeEnum,
                relationship: updateData.relationship,
                updated_at: new Date()
            };

            // Convert collection_date to Date object if provided
            if (updateData.collection_date) {
                updateFields.collection_date = new Date(updateData.collection_date);
            }

            // Remove undefined fields
            Object.keys(updateFields).forEach(key => {
                if (updateFields[key as keyof Partial<IRegistrationForm>] === undefined) {
                    delete updateFields[key as keyof Partial<IRegistrationForm>];
                }
            });

            // Update the form
            const updatedForm = await this.registrationFormRepository.findByIdAndUpdate(
                formId,
                updateFields,
                { new: true }
            );

            if (!updatedForm) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to update registration form');
            }

            return updatedForm;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error updating registration form');
        }
    }

    /**
     * Get registration form by ID
     */
    public async getRegistrationFormById(id: string): Promise<IRegistrationForm> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid registration form ID');
        }

        const form = await this.registrationFormRepository.findByIdWithPopulate(id);
        if (!form) {
            throw new HttpException(HttpStatus.NotFound, 'Registration form not found');
        }

        return form;
    }

    /**
     * Get registration form by sample ID
     */
    public async getRegistrationFormBySampleId(sampleId: string): Promise<IRegistrationForm> {
        if (!mongoose.Types.ObjectId.isValid(sampleId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid sample ID');
        }

        const form = await this.registrationFormRepository.findBySampleId(sampleId);
        if (!form) {
            throw new HttpException(HttpStatus.NotFound, 'Registration form not found for this sample');
        }

        return form;
    }

    /**
     * Get all registration forms with pagination
     */
    public async getAllRegistrationForms(page: number = 1, limit: number = 10): Promise<{ forms: IRegistrationForm[], total: number, page: number, limit: number }> {
        try {
            const skip = (page - 1) * limit;
            const forms = await this.registrationFormRepository.findWithPopulate({}, { created_at: -1 }, skip, limit);
            const total = await this.registrationFormRepository.countDocuments({});

            return {
                forms,
                total,
                page,
                limit
            };
        } catch (error) {
            throw new HttpException(HttpStatus.InternalServerError, 'Error fetching registration forms');
        }
    }
} 