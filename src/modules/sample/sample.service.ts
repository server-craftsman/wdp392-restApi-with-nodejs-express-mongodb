import mongoose, { Schema } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IPersonInfo, ISample } from './sample.interface';
import { SampleStatusEnum, SampleTypeEnum, CollectionMethodEnum } from './sample.enum';
import SampleRepository from './sample.repository';
import { AppointmentLogService } from '../appointment_log';
import { AppointmentLogTypeEnum } from '../appointment_log/appointment_log.enum';
import AppointmentService from '../appointment/appointment.service';
import { AppointmentStatusEnum } from '../appointment/appointment.enum';
import KitService from '../kit/kit.service';
import { KitStatusEnum } from '../kit/kit.enum';
import { SampleSelectionDto } from '../appointment/dtos/createAppointment.dto';
import { TypeEnum } from '../appointment/appointment.enum';
import { AddSampleDto } from './dtos/addSample.dto';
import { SearchPaginationResponseModel } from "../../core/models";
import { CollectSampleDto } from './dtos/collect-sample.dto';
import AppointmentSchema from '../appointment/appointment.model';
import ServiceSchema from '../service/service.model';
import { ServiceTypeEnum } from '../service/service.enum';

/**
 * Helper function to compare MongoDB ObjectIds or strings
 * @param id1 First ID
 * @param id2 Second ID
 * @returns True if the IDs are equal
 */
function areIdsEqual(id1: any, id2: any): boolean {
    if (!id1 || !id2) return false;

    // Convert both to strings and remove any quotes
    const str1 = String(id1).replace(/^"|"$/g, '').trim();
    const str2 = String(id2).replace(/^"|"$/g, '').trim();

    // Try direct string comparison first
    if (str1 === str2) return true;

    // If that fails, try comparing the last 24 chars (MongoDB ObjectId length)
    if (str1.length >= 24 && str2.length >= 24) {
        return str1.slice(-24) === str2.slice(-24); // Compare the last 24 characters of the strings
    }

    return false;
}

/**
 * Helper function to extract user ID from an appointment object that might have populated user_id
 * @param appointment The appointment object
 * @returns The extracted user ID as a string
 */
function extractUserIdFromAppointment(appointment: any): string {
    if (!appointment || !appointment.user_id) {
        throw new Error('User ID not found in appointment');
    }

    // If user_id is an object (populated)
    if (typeof appointment.user_id === 'object' && appointment.user_id !== null) {
        const userObj = appointment.user_id;

        // If populated with _id field
        if (userObj._id) {
            return userObj._id.toString();
        }

        // If populated with id field
        if (userObj.id) {
            return userObj.id.toString();
        }

        // If it's another type of object, try to convert to string
        return String(appointment.user_id);
    }

    // If user_id is a primitive (string or ObjectId)
    return String(appointment.user_id);
}

/**
 * Helper function to extract appointment ID from a sample object that might have populated appointment_id
 * @param sample The sample object
 * @returns The extracted appointment ID as a string
 */
function extractAppointmentIdFromSample(sample: any): string {
    if (!sample || !sample.appointment_id) {
        throw new Error('Appointment ID not found in sample');
    }

    // If appointment_id is an object (populated)
    if (typeof sample.appointment_id === 'object' && sample.appointment_id !== null) {
        const appointmentObj = sample.appointment_id;

        // If populated with _id field
        if (appointmentObj._id) {
            return appointmentObj._id.toString();
        }

        // If it's another type of object, try to convert to string
        return String(sample.appointment_id);
    }

    // If appointment_id is a primitive (string or ObjectId)
    return String(sample.appointment_id);
}

/**
 * Helper function to extract kit ID from a sample object that might have populated kit_id
 * @param sample The sample object
 * @returns The extracted kit ID as a string
 */
function extractKitIdFromSample(sample: any): string {
    if (!sample || !sample.kit_id) {
        throw new Error('Kit ID not found in sample');
    }

    // If kit_id is an object (populated)
    if (typeof sample.kit_id === 'object' && sample.kit_id !== null) {
        const kitObj = sample.kit_id;

        // If populated with _id field
        if (kitObj._id) {
            return kitObj._id.toString();
        }

        // If it's another type of object, try to convert to string
        return String(sample.kit_id);
    }

    // If kit_id is a primitive (string or ObjectId)
    return String(sample.kit_id);
}

export default class SampleService {
    private readonly sampleRepository: SampleRepository;
    private readonly appointmentLogService: AppointmentLogService;
    private readonly kitService: KitService;
    private readonly appointmentService: AppointmentService;

    constructor() {
        this.sampleRepository = new SampleRepository();
        this.appointmentLogService = new AppointmentLogService();
        this.kitService = new KitService();
        this.appointmentService = new AppointmentService();
    }

    /**
     * Submit a sample (by customer)
     */
    public async submitSample(sampleId: string, collectionDate: string, userId: string): Promise<ISample> {
        try {
            // Validate sampleId
            if (!mongoose.Types.ObjectId.isValid(sampleId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid sample ID');
            }

            // Find the sample
            const sample = await this.sampleRepository.findByIdWithPopulate(sampleId);
            if (!sample) {
                throw new HttpException(HttpStatus.NotFound, 'Sample not found');
            }

            // Log for debugging
            console.log('Original sample object:', JSON.stringify(sample, null, 2));

            // Extract appointment_id using the helper function
            const appointmentId = extractAppointmentIdFromSample(sample);
            console.log('Extracted appointment ID:', appointmentId);

            // Verify that the sample belongs to the user making the request
            const appointment = await this.appointmentService.getAppointmentById(appointmentId);

            // Log for debugging
            console.log('Sample appointment_id:', sample.appointment_id, 'type:', typeof sample.appointment_id);
            console.log('Appointment:', JSON.stringify(appointment, null, 2));
            console.log('User ID passed to service:', userId);
            console.log('User ID type:', typeof userId);

            // Extract user_id using the helper function
            const appointmentUserId = extractUserIdFromAppointment(appointment);

            console.log(`Comparing appointment user ID: ${appointmentUserId} with current user ID: ${userId}`);
            console.log('Equal using === ?', appointmentUserId === userId);
            console.log('Equal using areIdsEqual?', areIdsEqual(appointmentUserId, userId));

            if (!areIdsEqual(appointmentUserId, userId)) {
                throw new HttpException(HttpStatus.Forbidden, 'You are not authorized to submit this sample');
            }

            // Verify that the sample is in PENDING status
            if (sample.status !== SampleStatusEnum.PENDING) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot submit sample with status ${sample.status}`
                );
            }

            // Update sample with collection date
            const updateData: any = {
                updated_at: new Date()
            };

            // Chỉ cập nhật collection_date nếu người dùng cung cấp giá trị mới
            if (collectionDate) {
                updateData.collection_date = new Date(collectionDate);
            }

            const updatedSample = await this.sampleRepository.findByIdAndUpdate(
                sampleId,
                updateData,
                { new: true }
            );

            if (!updatedSample) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to update sample');
            }

            // Update appointment status to SAMPLE_COLLECTED if not already
            if (appointment.status !== AppointmentStatusEnum.SAMPLE_COLLECTED) {
                await this.appointmentService.updateAppointmentStatus(
                    appointment._id.toString(),
                    AppointmentStatusEnum.SAMPLE_COLLECTED
                );

                // Log the status change
                try {
                    await this.appointmentLogService.logStatusChange(
                        appointment,
                        AppointmentLogTypeEnum.SAMPLE_COLLECTED
                    );
                } catch (logError) {
                    console.error('Failed to create appointment log for sample submission:', logError);
                }
            }

            // Update kit status to USED if not already
            try {
                // Extract kit_id using the helper function
                const kitId = extractKitIdFromSample(sample);
                console.log('Extracted kit ID:', kitId);

                const kit = await this.kitService.getKitById(kitId);
                console.log('Kit retrieved:', JSON.stringify(kit, null, 2));

                if (kit.status !== KitStatusEnum.USED) {
                    await this.kitService.changeKitStatus(kitId, KitStatusEnum.USED);
                }
            } catch (kitError) {
                console.error('Error updating kit status:', kitError);
                // Don't fail the sample submission if kit update fails
            }

            return updatedSample;
        } catch (error) {
            console.error('Error in submitSample:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new HttpException(HttpStatus.InternalServerError, `Error submitting sample: ${error.message}`);
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error submitting sample');
        }
    }

    /**
     * Receive a sample (by staff)
     */
    public async receiveSample(sampleId: string, receivedDate: string, staffId: string): Promise<ISample> {
        try {
            // Validate sampleId
            if (!mongoose.Types.ObjectId.isValid(sampleId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid sample ID');
            }

            // Find the sample
            const sample = await this.sampleRepository.findByIdWithPopulate(sampleId);
            if (!sample) {
                throw new HttpException(HttpStatus.NotFound, 'Sample not found');
            }

            // Log for debugging
            console.log('Original sample object:', JSON.stringify(sample, null, 2));

            // Extract appointment_id using the helper function
            const appointmentId = extractAppointmentIdFromSample(sample);
            console.log('Extracted appointment ID:', appointmentId);

            // Verify that the sample is in PENDING status
            if (sample.status !== SampleStatusEnum.PENDING) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot receive sample with status ${sample.status}`
                );
            }

            // Verify that the sample has been collected
            if (!sample.collection_date) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'Sample must be collected before it can be received'
                );
            }

            // Update sample with received date and status
            const updatedSample = await this.sampleRepository.findByIdAndUpdate(
                sampleId,
                {
                    received_date: new Date(receivedDate),
                    status: SampleStatusEnum.RECEIVED,
                    updated_at: new Date()
                },
                { new: true }
            );

            if (!updatedSample) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to update sample');
            }

            // Update appointment status to SAMPLE_RECEIVED
            const appointment = await this.appointmentService.getAppointmentById(appointmentId);

            // Log for debugging
            console.log('Sample appointment_id:', sample.appointment_id, 'type:', typeof sample.appointment_id);
            console.log('Appointment:', JSON.stringify(appointment, null, 2));
            console.log('Staff ID passed to service:', staffId);

            // Xử lý và ghi log thông tin appointment để debug
            if (appointment.user_id) {
                if (typeof appointment.user_id === 'object') {
                    const userObj = appointment.user_id as any;
                    console.log('User ID in appointment is an object:', userObj);
                } else {
                    console.log('User ID in appointment is a primitive:', appointment.user_id);
                }
            }

            if (appointment.status !== AppointmentStatusEnum.SAMPLE_RECEIVED) {
                await this.appointmentService.updateAppointmentStatus(
                    appointment._id.toString(),
                    AppointmentStatusEnum.SAMPLE_RECEIVED
                );

                // Log the status change
                try {
                    await this.appointmentLogService.logStatusChange(
                        appointment,
                        AppointmentLogTypeEnum.SAMPLE_RECEIVED
                    );
                } catch (logError) {
                    console.error('Failed to create appointment log for sample reception:', logError);
                }
            }

            // Log kit_id debugging information
            try {
                const kitId = extractKitIdFromSample(sample);
                console.log('Sample kit_id:', sample.kit_id, 'type:', typeof sample.kit_id);
                console.log('Extracted kit ID:', kitId);

                const kit = await this.kitService.getKitById(kitId);
                console.log('Kit status:', kit.status);
            } catch (kitError) {
                console.error('Error retrieving kit information:', kitError);
                // Just log the error, don't fail the sample reception
            }

            return updatedSample;
        } catch (error) {
            console.error('Error in receiveSample:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new HttpException(HttpStatus.InternalServerError, `Error receiving sample: ${error.message}`);
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error receiving sample');
        }
    }

    /**
     * Get sample by ID
     */
    public async getSampleById(id: string): Promise<ISample> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid sample ID');
        }

        const sample = await this.sampleRepository.findByIdWithPopulate(id);
        if (!sample) {
            throw new HttpException(HttpStatus.NotFound, 'Sample not found');
        }

        // Log sample details for debugging
        console.log('Retrieved sample:', {
            _id: sample._id,
            appointment_id: typeof sample.appointment_id === 'object' ?
                (sample.appointment_id as any)?._id : sample.appointment_id,
            kit_id: typeof sample.kit_id === 'object' ?
                (sample.kit_id as any)?._id : sample.kit_id,
            type: sample.type,
            status: sample.status
        });

        return sample;
    }

    /**
     * Update sample status
     */
    public async updateSampleStatus(sampleId: string, status: SampleStatusEnum): Promise<ISample> {
        try {
            // Validate sampleId
            if (!mongoose.Types.ObjectId.isValid(sampleId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid sample ID');
            }

            // Find the sample
            const sample = await this.getSampleById(sampleId);

            // Update sample status
            const updatedSample = await this.sampleRepository.findByIdAndUpdate(
                sampleId,
                {
                    status: status,
                    updated_at: new Date()
                },
                { new: true }
            );

            if (!updatedSample) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to update sample status');
            }

            return updatedSample;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error updating sample status');
        }
    }

    /**
     * Get samples by appointment ID
     */
    public async getSamplesByAppointmentId(appointmentId: string): Promise<ISample[]> {
        try {
            // Validate appointmentId
            if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID');
            }

            console.log('Finding samples for appointment ID:', appointmentId);

            // Verify that the appointment exists
            const appointment = await this.appointmentService.getAppointmentById(appointmentId);

            // Extract the ID to ensure we're using a consistent format
            const appointmentIdStr = appointment._id.toString();
            console.log('Found appointment:', appointmentIdStr);

            // Find samples associated with the appointment
            const samples = await this.sampleRepository.findByAppointmentId(appointmentIdStr);
            console.log(`Found ${samples.length} samples for appointment ${appointmentIdStr}`);

            return samples;
        } catch (error) {
            console.error('Error in getSamplesByAppointmentId:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error retrieving samples for appointment');
        }
    }

    /**
     * Create samples for an appointment
     * @param appointmentId The ID of the appointment
     * @param sampleTypes Array of sample types to create
     * @param collectionMethod The collection method (SELF, FACILITY, HOME)
     * @deprecated Use addSampleToAppointment instead
     */
    public async createSamplesForAppointment(
        appointmentId: string,
        sampleTypes: SampleSelectionDto[],
        collectionMethod: TypeEnum
    ): Promise<ISample[]> {
        console.warn('DEPRECATED: createSamplesForAppointment is deprecated. Use addSampleToAppointment instead.');
        try {
            if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID');
            }

            // If no sample types provided, use default SALIVA
            if (!sampleTypes || sampleTypes.length === 0) {
                console.log(`No sample types provided for appointment ${appointmentId}, using default SALIVA`);
                sampleTypes = [{ type: SampleTypeEnum.SALIVA }];
            } else {
                console.log(`Creating ${sampleTypes.length} samples for appointment ${appointmentId}:`,
                    sampleTypes.map(s => s.type).join(', '));
            }

            // Get available kits for the samples
            const kitService = this.kitService;
            const availableKits = await kitService.getAvailableKits();
            console.log(`Found ${availableKits.length} available kits`);

            if (availableKits.length < sampleTypes.length) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Not enough available kits. Need ${sampleTypes.length} but only ${availableKits.length} available.`
                );
            }

            // Get appointment data for logging
            const appointment = await this.appointmentService.getAppointmentById(appointmentId);

            // Create samples with assigned kits
            const samples: ISample[] = [];
            const assignedKits: string[] = [];

            for (let i = 0; i < sampleTypes.length; i++) {
                const kit = availableKits[i];

                // First, assign the kit to the appointment
                try {
                    await kitService.changeKitStatus(kit._id.toString(), KitStatusEnum.ASSIGNED);
                    assignedKits.push(kit._id.toString());
                    console.log(`Kit ${kit.code || kit._id} assigned to appointment ${appointmentId}`);
                } catch (kitError) {
                    console.error(`Failed to assign kit ${kit._id} to appointment:`, kitError);
                    // If kit assignment fails, try to revert any previously assigned kits
                    for (const assignedKitId of assignedKits) {
                        try {
                            await kitService.changeKitStatus(assignedKitId, KitStatusEnum.AVAILABLE);
                        } catch (revertError) {
                            console.error(`Failed to revert kit ${assignedKitId} status:`, revertError);
                        }
                    }
                    throw new HttpException(HttpStatus.InternalServerError, 'Failed to assign kits to appointment');
                }

                // Then create the sample with the assigned kit
                try {
                    const sample = await this.sampleRepository.create({
                        appointment_id: appointmentId as any,
                        kit_id: kit._id.toString() as any,
                        type: sampleTypes[i].type,
                        collection_method: collectionMethod as unknown as CollectionMethodEnum,
                        collection_date: new Date(),
                        status: SampleStatusEnum.PENDING,
                        created_at: new Date(),
                        updated_at: new Date()
                    });

                    console.log(`Sample created with ID ${sample._id}, type ${sample.type}`);
                    samples.push(sample);
                } catch (sampleError) {
                    console.error(`Failed to create sample for kit ${kit._id}:`, sampleError);
                    // If sample creation fails, try to revert kit status
                    try {
                        await kitService.changeKitStatus(kit._id.toString(), KitStatusEnum.AVAILABLE);
                    } catch (revertError) {
                        console.error(`Failed to revert kit ${kit._id} status:`, revertError);
                    }
                    throw new HttpException(HttpStatus.InternalServerError, 'Failed to create sample');
                }
            }

            // Log the sample creation event
            try {
                await this.appointmentLogService.logSampleCreation(appointment, samples);
                console.log(`Successfully logged sample creation for appointment ${appointmentId}`);
            } catch (logError) {
                console.error('Failed to create log for sample creation:', logError);
                // Don't fail the sample creation if logging fails
            }

            return samples;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error('Error in createSamplesForAppointment:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating samples for appointment');
        }
    }

    /**
     * Add a sample to an existing appointment
     * @param userId ID of the user adding the sample
     * @param addSampleData Data for adding a sample
     */
    public async addSampleToAppointment(userId: string, addSampleData: AddSampleDto): Promise<ISample[]> {
        try {
            // Validate appointmentId
            if (!mongoose.Types.ObjectId.isValid(addSampleData.appointment_id)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID');
            }

            // Get the appointment
            const appointment = await this.appointmentService.getAppointmentById(addSampleData.appointment_id);
            if (!appointment) {
                throw new HttpException(HttpStatus.NotFound, 'Appointment not found');
            }

            // Check if the appointment belongs to the user
            const appointmentUserId = extractUserIdFromAppointment(appointment);
            if (!areIdsEqual(appointmentUserId, userId)) {
                throw new HttpException(HttpStatus.Forbidden, 'You are not authorized to add samples to this appointment');
            }

            // Validate that there are at least 2 sample types
            if (!addSampleData.sample_types || addSampleData.sample_types.length < 2) {
                throw new HttpException(HttpStatus.BadRequest, 'At least 2 sample types are required');
            }

            // Check if person_info_list is provided and matches the length of sample_types
            if (addSampleData.person_info_list &&
                addSampleData.person_info_list.length !== addSampleData.sample_types.length) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'The number of person_info entries must match the number of sample types'
                );
            }

            const samples: ISample[] = [];

            // Kiểm tra appointment
            const appointmentSchema = await AppointmentSchema.findById(addSampleData.appointment_id);
            if (!appointmentSchema) throw new Error('Appointment not found');
            // Lấy service để kiểm tra loại
            const service = await ServiceSchema.findById(appointmentSchema.service_id);
            if (service && service.type === ServiceTypeEnum.ADMINISTRATIVE) {
                addSampleData.collection_method = CollectionMethodEnum.FACILITY;
            }

            // Determine collection method
            let resolvedCollectionMethod: CollectionMethodEnum = (addSampleData.collection_method as CollectionMethodEnum) || CollectionMethodEnum.SELF;

            // For ADMINISTRATIVE services, always force FACILITY collection method
            if (service && service.type === ServiceTypeEnum.ADMINISTRATIVE) {
                resolvedCollectionMethod = CollectionMethodEnum.FACILITY;
            }

            // Process each sample type
            for (let i = 0; i < addSampleData.sample_types.length; i++) {
                const sampleType = addSampleData.sample_types[i];

                // Get an available kit
                let kitId = addSampleData.kit_id;
                if (!kitId || i > 0) {
                    // Only use the specified kit for the first sample, get new kits for the rest
                    const availableKits = await this.kitService.getAvailableKits();
                    if (!availableKits || availableKits.length === 0) {
                        throw new HttpException(HttpStatus.BadRequest, 'No available kits found');
                    }
                    kitId = availableKits[0]._id.toString();
                }

                // Update the kit status to ASSIGNED
                await this.kitService.changeKitStatus(kitId, KitStatusEnum.ASSIGNED);

                // Create the sample
                const sampleData: any = {
                    appointment_id: addSampleData.appointment_id,
                    kit_id: kitId,
                    type: sampleType,
                    collection_method: resolvedCollectionMethod as CollectionMethodEnum,
                    collection_date: new Date(),
                    status: SampleStatusEnum.PENDING,
                };

                // Set person_info from the corresponding entry in person_info_list if available
                if (addSampleData.person_info_list && addSampleData.person_info_list[i]) {
                    sampleData.person_info = addSampleData.person_info_list[i];
                } else if (addSampleData.person_info) {
                    // Fall back to the single person_info if available
                    sampleData.person_info = addSampleData.person_info;
                }

                const sample = await this.sampleRepository.create(sampleData);
                samples.push(sample);
            }

            // Log the sample addition
            await this.appointmentLogService.logSampleCreation(appointment, samples);

            // Change appointment status to SAMPLE_ASSIGNED if not already
            if (appointment.status !== AppointmentStatusEnum.SAMPLE_ASSIGNED) {
                await this.appointmentService.updateAppointmentStatus(
                    addSampleData.appointment_id,
                    AppointmentStatusEnum.SAMPLE_ASSIGNED
                );
                // Optionally, log the status change if you have a log method for this
                try {
                    await this.appointmentLogService.logStatusChange(
                        appointment,
                        AppointmentLogTypeEnum.SAMPLE_ASSIGNED
                    );
                } catch (logError) {
                    console.error('Failed to create appointment log for SAMPLE_ASSIGNED:', logError);
                }
            }

            return samples;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error('Error in addSampleToAppointment:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to add samples to appointment');
        }
    }

    /**
     * Submit multiple samples at once (by customer)
     * @param sampleIds Array of sample IDs to submit
     * @param collectionDate Optional collection date for all samples
     * @param userId ID of the user submitting the samples
     */
    public async batchSubmitSamples(sampleIds: string[], collectionDate: string | undefined, userId: string): Promise<ISample[]> {
        try {
            if (!sampleIds || sampleIds.length === 0) {
                throw new HttpException(HttpStatus.BadRequest, 'No sample IDs provided');
            }

            // Validate all sample IDs
            for (const sampleId of sampleIds) {
                if (!mongoose.Types.ObjectId.isValid(sampleId)) {
                    throw new HttpException(HttpStatus.BadRequest, `Invalid sample ID: ${sampleId}`);
                }
            }

            // Find all samples
            const samples = await this.sampleRepository.findManyByIds(sampleIds);
            if (samples.length !== sampleIds.length) {
                throw new HttpException(HttpStatus.NotFound, 'One or more samples not found');
            }

            // Group samples by appointment ID for efficient processing
            const samplesByAppointment = new Map<string, ISample[]>();

            for (const sample of samples) {
                const appointmentId = extractAppointmentIdFromSample(sample);

                if (!samplesByAppointment.has(appointmentId)) {
                    samplesByAppointment.set(appointmentId, []);
                }

                samplesByAppointment.get(appointmentId)!.push(sample);
            }

            // Verify authorization and validate samples for each appointment
            for (const [appointmentId, appointmentSamples] of samplesByAppointment.entries()) {
                // Verify that the samples belong to the user making the request
                const appointment = await this.appointmentService.getAppointmentById(appointmentId);
                const appointmentUserId = extractUserIdFromAppointment(appointment);

                if (!areIdsEqual(appointmentUserId, userId)) {
                    throw new HttpException(HttpStatus.Forbidden,
                        `You are not authorized to submit samples for appointment ${appointmentId}`);
                }

                // Verify that all samples are in PENDING status
                for (const sample of appointmentSamples) {
                    if (sample.status !== SampleStatusEnum.PENDING) {
                        throw new HttpException(
                            HttpStatus.BadRequest,
                            `Cannot submit sample ${sample._id} with status ${sample.status}`
                        );
                    }
                }
            }

            // Update all samples
            const updatedSamples: ISample[] = [];
            const updateData: any = {
                updated_at: new Date()
            };

            // Only update collection_date if provided
            if (collectionDate) {
                updateData.collection_date = new Date(collectionDate);
            }

            // Update each sample
            for (const sampleId of sampleIds) {
                const updatedSample = await this.sampleRepository.findByIdAndUpdate(
                    sampleId,
                    updateData,
                    { new: true }
                );

                if (!updatedSample) {
                    throw new HttpException(HttpStatus.InternalServerError, `Failed to update sample ${sampleId}`);
                }

                updatedSamples.push(updatedSample);
            }

            // Update appointment status and kit status for each appointment
            for (const [appointmentId, appointmentSamples] of samplesByAppointment.entries()) {
                const appointment = await this.appointmentService.getAppointmentById(appointmentId);

                // Update appointment status to SAMPLE_COLLECTED if not already
                if (appointment.status !== AppointmentStatusEnum.SAMPLE_COLLECTED) {
                    await this.appointmentService.updateAppointmentStatus(
                        appointmentId,
                        AppointmentStatusEnum.SAMPLE_COLLECTED
                    );

                    // Log the status change
                    try {
                        await this.appointmentLogService.logStatusChange(
                            appointment,
                            AppointmentLogTypeEnum.SAMPLE_COLLECTED
                        );
                    } catch (logError) {
                        console.error('Failed to create appointment log for batch sample submission:', logError);
                    }
                }

                // Update kit status to USED for each sample
                for (const sample of appointmentSamples) {
                    try {
                        const kitId = extractKitIdFromSample(sample);
                        const kit = await this.kitService.getKitById(kitId);

                        if (kit.status !== KitStatusEnum.USED) {
                            await this.kitService.changeKitStatus(kitId, KitStatusEnum.USED);
                        }
                    } catch (kitError) {
                        console.error(`Error updating kit status for sample ${sample._id}:`, kitError);
                        // Don't fail the batch submission if kit update fails
                    }
                }
            }

            return updatedSamples;
        } catch (error) {
            console.error('Error in batchSubmitSamples:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new HttpException(HttpStatus.InternalServerError, `Error submitting samples: ${error.message}`);
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error submitting samples');
        }
    }

    /**
     * Receive multiple samples at once (by staff)
     * @param sampleIds Array of sample IDs to receive
     * @param receivedDate Received date for all samples
     * @param staffId ID of the staff receiving the samples
     */
    public async batchReceiveSamples(sampleIds: string[], receivedDate: string, staffId: string): Promise<ISample[]> {
        try {
            if (!sampleIds || sampleIds.length === 0) {
                throw new HttpException(HttpStatus.BadRequest, 'No sample IDs provided');
            }

            // Validate all sample IDs
            for (const sampleId of sampleIds) {
                if (!mongoose.Types.ObjectId.isValid(sampleId)) {
                    throw new HttpException(HttpStatus.BadRequest, `Invalid sample ID: ${sampleId}`);
                }
            }

            // Find all samples
            const samples = await this.sampleRepository.findManyByIds(sampleIds);
            if (samples.length !== sampleIds.length) {
                throw new HttpException(HttpStatus.NotFound, 'One or more samples not found');
            }

            // Group samples by appointment ID for efficient processing
            const samplesByAppointment = new Map<string, ISample[]>();

            for (const sample of samples) {
                const appointmentId = extractAppointmentIdFromSample(sample);

                if (!samplesByAppointment.has(appointmentId)) {
                    samplesByAppointment.set(appointmentId, []);
                }

                samplesByAppointment.get(appointmentId)!.push(sample);
            }

            // Validate samples for each appointment
            for (const appointmentSamples of samplesByAppointment.values()) {
                // Verify that all samples are in PENDING status and have been collected
                for (const sample of appointmentSamples) {
                    if (sample.status !== SampleStatusEnum.PENDING) {
                        throw new HttpException(
                            HttpStatus.BadRequest,
                            `Cannot receive sample ${sample._id} with status ${sample.status}`
                        );
                    }

                    if (!sample.collection_date) {
                        throw new HttpException(
                            HttpStatus.BadRequest,
                            `Sample ${sample._id} must be collected before it can be received`
                        );
                    }
                }
            }

            // Update all samples
            const updatedSamples: ISample[] = [];
            const receivedDate_obj = new Date(receivedDate);

            // Update each sample
            for (const sampleId of sampleIds) {
                const updatedSample = await this.sampleRepository.findByIdAndUpdate(
                    sampleId,
                    {
                        received_date: receivedDate_obj,
                        status: SampleStatusEnum.RECEIVED,
                        updated_at: new Date()
                    },
                    { new: true }
                );

                if (!updatedSample) {
                    throw new HttpException(HttpStatus.InternalServerError, `Failed to update sample ${sampleId}`);
                }

                updatedSamples.push(updatedSample);
            }

            // Update appointment status for each appointment
            for (const [appointmentId, _] of samplesByAppointment.entries()) {
                const appointment = await this.appointmentService.getAppointmentById(appointmentId);

                // Update appointment status to SAMPLE_RECEIVED if not already
                if (appointment.status !== AppointmentStatusEnum.SAMPLE_RECEIVED) {
                    await this.appointmentService.updateAppointmentStatus(
                        appointmentId,
                        AppointmentStatusEnum.SAMPLE_RECEIVED
                    );

                    // Log the status change
                    try {
                        await this.appointmentLogService.logStatusChange(
                            appointment,
                            AppointmentLogTypeEnum.SAMPLE_RECEIVED
                        );
                    } catch (logError) {
                        console.error('Failed to create appointment log for batch sample reception:', logError);
                    }
                }
            }

            return updatedSamples;
        } catch (error) {
            console.error('Error in batchReceiveSamples:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new HttpException(HttpStatus.InternalServerError, `Error receiving samples: ${error.message}`);
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error receiving samples');
        }
    }

    /**
     * Update a person's image URL in a sample
     * @param sampleId ID of the sample
     * @param imageUrl URL of the uploaded image
     * @param userId ID of the user making the request
     */
    public async updatePersonImage(
        sampleId: string,
        imageUrl: string,
        userId: string
    ): Promise<ISample> {
        try {
            console.log("updatePersonImage called with:", { sampleId, imageUrl, userId });

            // Validate sampleId
            if (!mongoose.Types.ObjectId.isValid(sampleId)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid sample ID');
            }

            // Find the sample
            const sample = await this.sampleRepository.findByIdWithPopulate(sampleId);
            if (!sample) {
                throw new HttpException(HttpStatus.NotFound, 'Sample not found');
            }

            console.log("Sample found:", {
                id: sample._id,
                hasSinglePersonInfo: !!sample.person_info,
                hasPersonInfoList: !!sample.person_info_list,
                personInfoListLength: sample.person_info_list?.length
            });

            // Extract appointment_id using the helper function
            const appointmentId = extractAppointmentIdFromSample(sample);

            // Verify that the sample belongs to the user making the request
            const appointment = await this.appointmentService.getAppointmentById(appointmentId);
            const appointmentUserId = extractUserIdFromAppointment(appointment);

            if (!areIdsEqual(appointmentUserId, userId)) {
                throw new HttpException(HttpStatus.Forbidden, 'You are not authorized to update this sample');
            }

            // Always update the single person_info object
            if (!sample.person_info) {
                sample.person_info = { name: 'Unknown', image_url: imageUrl };
            } else {
                sample.person_info.image_url = imageUrl;
            }

            // Update the sample
            const updatedSample = await this.sampleRepository.findByIdAndUpdate(
                sampleId,
                { person_info: sample.person_info, updated_at: new Date() },
                { new: true }
            );

            if (!updatedSample) {
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to update sample');
            }

            return updatedSample;
        } catch (error) {
            console.error('Error in updatePersonImage:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new HttpException(HttpStatus.InternalServerError, `Error updating person image: ${error.message}`);
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error updating person image');
        }
    }

    /**
     * Get samples ready for testing (samples with status RECEIVED)
     * This is used by laboratory technicians to find samples that are ready to be tested
     */
    public async getSamplesReadyForTesting(page: number = 1, limit: number = 10): Promise<SearchPaginationResponseModel<ISample>> {
        try {
            const skip = (page - 1) * limit;

            // Find samples with status RECEIVED
            const query = { status: SampleStatusEnum.RECEIVED };

            // Get total count for pagination
            const total = await this.sampleRepository.countDocuments(query);

            // Find samples with pagination and populate related fields
            const samples = await this.sampleRepository.findWithPopulate(
                query,
                { received_date: -1 }, // Sort by received date, newest first
                skip,
                limit
            );

            // Calculate total pages
            const pages = Math.ceil(total / limit);

            return new SearchPaginationResponseModel<ISample>(
                samples,
                {
                    totalItems: total,
                    totalPages: pages,
                    pageNum: page,
                    pageSize: limit
                }
            );
        } catch (error) {
            console.error('Error in getSamplesReadyForTesting:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error retrieving samples ready for testing');
        }
    }

    /**
     * Get all samples with RECEIVED status
     * This endpoint is used by laboratory technicians to view all samples that need testing
     */
    public async getSamplesForTesting(page: number = 1, limit: number = 10): Promise<SearchPaginationResponseModel<ISample>> {
        try {
            const skip = (page - 1) * limit;

            const query = { status: SampleStatusEnum.TESTING };

            // Get total count for pagination
            const total = await this.sampleRepository.countDocuments(query);

            // Find samples with pagination and populate related fields
            const samples = await this.sampleRepository.findWithPopulate(
                query,
                { received_date: -1 }, // Sort by received date, newest first
                skip,
                limit
            );

            // Calculate total pages
            const pages = Math.ceil(total / limit);

            return new SearchPaginationResponseModel<ISample>(
                samples,
                {
                    totalItems: total,
                    totalPages: pages,
                    pageNum: page,
                    pageSize: limit
                }
            );
        } catch (error) {
            console.error('Error in getSamplesForTesting:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error retrieving samples for testing');
        }
    }

    /**
     * Search samples by various criteria
     * This allows laboratory technicians to search for samples by different parameters
     */
    public async searchSamples(
        options: {
            status?: SampleStatusEnum,
            type?: SampleTypeEnum,
            appointmentId?: string,
            kitCode?: string,
            personName?: string,
            startDate?: Date,
            endDate?: Date,
            page?: number,
            limit?: number
        }
    ): Promise<SearchPaginationResponseModel<ISample>> {
        try {
            // Extract options with default values and validation
            const {
                status,
                type,
                appointmentId,
                kitCode,
                personName,
                startDate,
                endDate
            } = options;

            // Ensure page and limit are valid numbers with defaults
            const page = options.page && options.page > 0 ? Math.floor(options.page) : 1;
            const limit = options.limit && options.limit > 0 ? Math.floor(options.limit) : 10;
            const skip = (page - 1) * limit;

            console.log('Search options in service:', {
                status, type, appointmentId, kitCode, personName,
                startDate, endDate, page, limit, skip
            });

            // Build query object
            const query: any = {};

            // Add status filter if provided and valid
            if (status) {
                // Check if status is a valid enum value
                try {
                    // Simple string check instead of using Object.values
                    const validStatuses = ['pending', 'received', 'testing', 'completed', 'invalid'];
                    if (validStatuses.includes(status.toLowerCase())) {
                        query.status = status;
                    }
                } catch (err) {
                    console.log('Error validating status:', err);
                }
            }

            // Add type filter if provided and valid
            if (type) {
                // Check if type is a valid enum value
                try {
                    // Simple string check instead of using Object.values
                    const validTypes = ['saliva', 'blood', 'hair', 'other'];
                    if (validTypes.includes(type.toLowerCase())) {
                        query.type = type;
                    }
                } catch (err) {
                    console.log('Error validating type:', err);
                }
            }

            // Add appointment ID filter if provided and valid
            if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
                query.appointment_id = new mongoose.Types.ObjectId(appointmentId);
            }

            // Add date range filter if either start or end date is provided
            if (startDate instanceof Date || endDate instanceof Date) {
                query.updated_at = {};

                // Add start date filter if valid
                if (startDate instanceof Date && !isNaN(startDate.getTime())) {
                    query.updated_at.$gte = startDate;
                }

                // Add end date filter if valid
                if (endDate instanceof Date && !isNaN(endDate.getTime())) {
                    query.updated_at.$lte = endDate;
                }

                // If no valid date filters were added, remove the empty updated_at filter
                if (Object.keys(query.updated_at).length === 0) {
                    delete query.updated_at;
                }
            }

            console.log('MongoDB query:', JSON.stringify(query, null, 2));

            // Get total count for pagination
            const total = await this.sampleRepository.countDocuments(query);

            // Find samples with pagination and populate related fields
            let samples = await this.sampleRepository.findWithPopulate(
                query,
                { updated_at: -1 }, // Sort by updated date, newest first
                skip,
                limit
            );

            // In-memory filtering for properties that can't be filtered in the database query
            let filteredTotal = total;

            // Filter by kit code if provided
            if (kitCode && kitCode.trim() !== '') {
                samples = samples.filter(sample => {
                    const kit = sample.kit_id as any;
                    return kit &&
                        kit.code &&
                        typeof kit.code === 'string' &&
                        kit.code.toLowerCase().includes(kitCode.toLowerCase());
                });
                filteredTotal = samples.length;
            }

            // Filter by person name if provided
            if (personName && personName.trim() !== '') {
                samples = samples.filter(sample => {
                    // Check in single person_info
                    if (sample.person_info &&
                        sample.person_info.name &&
                        typeof sample.person_info.name === 'string') {
                        return sample.person_info.name.toLowerCase().includes(personName.toLowerCase());
                    }

                    // Check in person_info_list
                    if (sample.person_info_list &&
                        Array.isArray(sample.person_info_list) &&
                        sample.person_info_list.length > 0) {
                        return sample.person_info_list.some(person =>
                            person &&
                            person.name &&
                            typeof person.name === 'string' &&
                            person.name.toLowerCase().includes(personName.toLowerCase())
                        );
                    }

                    return false;
                });
                filteredTotal = samples.length;
            }

            // Calculate total pages based on filtered total
            const pages = Math.ceil(filteredTotal / limit);

            // Return paginated results using SearchPaginationResponseModel
            return new SearchPaginationResponseModel<ISample>(
                samples.slice(0, limit), // Ensure we don't return more than the limit
                {
                    totalItems: filteredTotal,
                    totalPages: pages > 0 ? pages : 1, // Ensure at least 1 page even if no results
                    pageNum: page,
                    pageSize: limit
                }
            );
        } catch (error) {
            console.error('Error in searchSamples service:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error searching samples');
        }
    }

    /**
     * Collect sample at facility
     */
    public async collectSampleAtFacility(model: CollectSampleDto, staff_id: string): Promise<ISample[]> {
        const appointment = await this.appointmentService.getAppointmentById(model.appointment_id);
        if (!appointment) {
            throw new HttpException(HttpStatus.NotFound, 'Appointment not found');
        }

        // if (appointment.status === AppointmentStatusEnum.PENDING) {
        //     throw new HttpException(HttpStatus.BadRequest, 'Appointment must be confirmed or pending before collecting sample');
        // }

        if (appointment.status !== AppointmentStatusEnum.CONFIRMED && appointment.status !== AppointmentStatusEnum.PENDING) {
            throw new HttpException(HttpStatus.BadRequest, 'Appointment must be confirmed or pending before collecting sample');
        }

        // Validate that number of sample types matches number of person info entries
        if (model.type.length !== model.person_info.length) {
            throw new HttpException(HttpStatus.BadRequest, 'Number of sample types must match number of person information entries');
        }

        // Get available kits
        const availableKits = await this.kitService.getAvailableKits();
        if (availableKits.length < model.type.length) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `Not enough available kits. Need ${model.type.length} but only ${availableKits.length} available.`
            );
        }

        const samples: ISample[] = [];

        // Create a sample for each type and person info
        for (let i = 0; i < model.type.length; i++) {
            // Get an available kit
            const kit = availableKits[i];

            // Update kit status to ASSIGNED
            await this.kitService.changeKitStatus(kit._id.toString(), KitStatusEnum.ASSIGNED);

            // Validate the collection date is valid before creating the sample
            if (model.collection_date && isNaN(new Date(model.collection_date).getTime())) {
                throw new HttpException(HttpStatus.BadRequest, 'collection_date must be a valid ISO 8601 date string');
            }

            const sampleData: Partial<ISample> = {
                appointment_id: model.appointment_id,
                kit_id: kit._id.toString(),
                type: model.type[i],
                collection_method: CollectionMethodEnum.FACILITY,
                collection_date: model.collection_date ? new Date(model.collection_date) : new Date(),
                status: SampleStatusEnum.PENDING,
                person_info: model.person_info[i] as IPersonInfo,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: staff_id,
                updated_by: staff_id
            };

            const sample = await this.sampleRepository.create(sampleData);
            samples.push(sample);
        }

        // Update appointment status to SAMPLE_COLLECTED
        await this.appointmentService.updateAppointmentStatus(
            model.appointment_id,
            AppointmentStatusEnum.SAMPLE_COLLECTED
        );

        return samples;
    }
} 