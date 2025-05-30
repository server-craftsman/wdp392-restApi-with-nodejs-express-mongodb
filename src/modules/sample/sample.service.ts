import mongoose, { Schema } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { ISample } from './sample.interface';
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
        return str1.slice(-24) === str2.slice(-24);
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
    private appointmentService?: AppointmentService;

    constructor() {
        this.sampleRepository = new SampleRepository();
        this.appointmentLogService = new AppointmentLogService();
        this.kitService = new KitService();
    }

    private getAppointmentService(): AppointmentService {
        if (!this.appointmentService) {
            this.appointmentService = new AppointmentService();
        }
        return this.appointmentService;
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
            const appointment = await this.getAppointmentService().getAppointmentById(appointmentId);

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
                await this.getAppointmentService().updateAppointmentStatus(
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
            const appointment = await this.getAppointmentService().getAppointmentById(appointmentId);

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
                await this.getAppointmentService().updateAppointmentStatus(
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
            const appointment = await this.getAppointmentService().getAppointmentById(appointmentId);

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
            const appointment = await this.getAppointmentService().getAppointmentById(appointmentId);

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
            // Validate appointment ID
            if (!mongoose.Types.ObjectId.isValid(addSampleData.appointment_id)) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid appointment ID');
            }

            // Get appointment data
            const appointment = await this.getAppointmentService().getAppointmentById(addSampleData.appointment_id);
            console.log('Appointment:', JSON.stringify(appointment, null, 2));
            console.log('User ID passed to service:', userId);
            console.log('User ID type:', typeof userId);

            try {
                // Extract user_id using the helper function
                const appointmentUserId = extractUserIdFromAppointment(appointment);

                console.log(`Comparing appointment user ID: ${appointmentUserId} with current user ID: ${userId}`);
                console.log('Equal using === ?', appointmentUserId === userId);
                console.log('Equal using areIdsEqual?', areIdsEqual(appointmentUserId, userId));

                if (!areIdsEqual(appointmentUserId, userId)) {
                    throw new HttpException(HttpStatus.Forbidden, 'You are not authorized to add samples to this appointment');
                }
            } catch (error) {
                console.error('Error extracting user ID from appointment:', error);
                throw new HttpException(HttpStatus.Forbidden, 'Failed to verify authorization for this appointment');
            }

            // Check if the appointment is in a valid state to add samples
            if (appointment.status !== AppointmentStatusEnum.PENDING &&
                appointment.status !== AppointmentStatusEnum.CONFIRMED) {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    `Cannot add samples to appointment with status ${appointment.status}`
                );
            }

            // Ensure sample_types is not empty
            if (!addSampleData.sample_types || addSampleData.sample_types.length === 0) {
                throw new HttpException(HttpStatus.BadRequest, 'No sample types provided');
            }

            // Get available kits for the samples
            const numSamplesNeeded = addSampleData.sample_types.length;
            let availableKits = [];

            if (addSampleData.kit_id) {
                // If specific kit_id is provided, validate and use it for the first sample
                if (!mongoose.Types.ObjectId.isValid(addSampleData.kit_id)) {
                    throw new HttpException(HttpStatus.BadRequest, 'Invalid kit ID');
                }

                // Check if kit exists and is available
                const kit = await this.kitService.getKitById(addSampleData.kit_id);
                if (kit.status !== KitStatusEnum.AVAILABLE) {
                    throw new HttpException(HttpStatus.BadRequest, `Kit is not available (status: ${kit.status})`);
                }

                // Only use this kit for the first sample
                availableKits.push(kit);

                // If more than one sample type, get additional kits
                if (numSamplesNeeded > 1) {
                    const additionalKits = await this.kitService.getAvailableKits();
                    // Exclude the specific kit if it's already in the list
                    const filteredKits = additionalKits.filter(k => k._id.toString() !== addSampleData.kit_id);

                    if (filteredKits.length < numSamplesNeeded - 1) {
                        throw new HttpException(
                            HttpStatus.BadRequest,
                            `Not enough available kits. Need ${numSamplesNeeded - 1} additional kits but only ${filteredKits.length} available.`
                        );
                    }

                    availableKits = [...availableKits, ...filteredKits.slice(0, numSamplesNeeded - 1)];
                }
            } else {
                // If no kit_id provided, find available kits
                availableKits = await this.kitService.getAvailableKits();
                if (availableKits.length < numSamplesNeeded) {
                    throw new HttpException(
                        HttpStatus.BadRequest,
                        `Not enough available kits. Need ${numSamplesNeeded} but only ${availableKits.length} available.`
                    );
                }

                // Use only the number of kits needed
                availableKits = availableKits.slice(0, numSamplesNeeded);
            }

            // Create samples with assigned kits
            const samples: ISample[] = [];
            const assignedKits: string[] = [];

            for (let i = 0; i < addSampleData.sample_types.length; i++) {
                const kit = availableKits[i];
                const kitId = kit._id.toString();

                // First, assign the kit to the appointment
                try {
                    await this.kitService.changeKitStatus(kitId, KitStatusEnum.ASSIGNED);
                    assignedKits.push(kitId);
                    console.log(`Kit ${kit.code || kitId} assigned to appointment ${addSampleData.appointment_id}`);
                } catch (kitError) {
                    console.error(`Failed to assign kit ${kitId} to appointment:`, kitError);
                    // If kit assignment fails, try to revert any previously assigned kits
                    for (const assignedKitId of assignedKits) {
                        try {
                            await this.kitService.changeKitStatus(assignedKitId, KitStatusEnum.AVAILABLE);
                        } catch (revertError) {
                            console.error(`Failed to revert kit ${assignedKitId} status:`, revertError);
                        }
                    }
                    throw new HttpException(HttpStatus.InternalServerError, 'Failed to assign kits to appointment');
                }

                // Then create the sample with the assigned kit
                try {
                    const sample = await this.sampleRepository.create({
                        appointment_id: addSampleData.appointment_id as any,
                        kit_id: kitId as any,
                        type: addSampleData.sample_types[i],
                        collection_method: appointment.type as unknown as CollectionMethodEnum,
                        collection_date: new Date(),
                        status: SampleStatusEnum.PENDING,
                        created_at: new Date(),
                        updated_at: new Date()
                    });

                    console.log(`Sample created with ID ${sample._id}, type ${sample.type}`);
                    samples.push(sample);
                } catch (sampleError) {
                    console.error(`Failed to create sample for kit ${kitId}:`, sampleError);
                    // If sample creation fails, try to revert kit status
                    try {
                        await this.kitService.changeKitStatus(kitId, KitStatusEnum.AVAILABLE);
                    } catch (revertError) {
                        console.error(`Failed to revert kit ${kitId} status:`, revertError);
                    }
                    throw new HttpException(HttpStatus.InternalServerError, 'Failed to create sample');
                }
            }

            // Log the sample creation event
            try {
                await this.appointmentLogService.logSampleCreation(appointment, samples);
                console.log(`Successfully logged sample creation for appointment ${addSampleData.appointment_id}`);
            } catch (logError) {
                console.error('Failed to create log for sample creation:', logError);
                // Don't fail the sample creation if logging fails
            }

            return samples;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error('Error in addSampleToAppointment:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error adding samples to appointment');
        }
    }
} 