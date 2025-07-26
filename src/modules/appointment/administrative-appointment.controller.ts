import { Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { formatResponse } from '../../core/utils';
import AdministrativeAppointmentService from './administrative-appointment.service';
import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateAdministrativeAppointmentDto, UpdateAppointmentProgressDto } from './dtos/createAdministrativeAppointment.dto';
import { AppointmentStatusEnum } from './appointment.enum';

export default class AdministrativeAppointmentController {
    private administrativeAppointmentService = new AdministrativeAppointmentService();

    /**
     * Create administrative appointment
     */
    public createAdministrativeAppointment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { caseId } = req.params;
            const userId = req.user?.id || '';

            // Basic validation checks
            if (!caseId) {
                throw new HttpException(HttpStatus.BadRequest, 'Case ID is required');
            }

            if (!userId) {
                throw new HttpException(HttpStatus.BadRequest, 'User ID is required');
            }

            // Validate DTO
            const dto = plainToClass(CreateAdministrativeAppointmentDto, req.body);

            try {
                await validateOrReject(dto);
            } catch (validationErrors) {
                throw new HttpException(HttpStatus.BadRequest, `Validation failed: ${JSON.stringify(validationErrors)}`);
            }

            // Validate appointment creation
            const validation = await this.administrativeAppointmentService.validateAppointmentCreation(caseId);

            if (!validation.canCreate) {
                throw new HttpException(HttpStatus.BadRequest, validation.reason || 'Cannot create appointment');
            }

            const appointment = await this.administrativeAppointmentService.createAdministrativeAppointment(
                caseId,
                {
                    user_id: dto.user_id,
                    service_id: dto.service_id,
                    appointment_date: dto.appointment_date,
                    collection_address: dto.collection_address,
                    staff_id: dto.staff_id,
                    laboratory_technician_id: dto.laboratory_technician_id,
                    participants: dto.participants || [],
                },
                userId,
            );

            res.status(HttpStatus.Created).json(formatResponse(appointment, true, 'Administrative appointment created successfully'));
        } catch (error: any) {
            console.error('Error creating administrative appointment:', {
                message: error.message,
                stack: error.stack,
                caseId: req.params?.caseId,
                userId: req.user?.id,
                body: req.body,
            });

            // If it's already an HttpException, throw it as is
            if (error instanceof HttpException) {
                throw error;
            }

            // Otherwise, create a new HttpException with the original error message
            throw new HttpException(HttpStatus.InternalServerError, `Error creating administrative appointment: ${error.message}`);
        }
    };

    /**
     * Get appointments for a case
     */
    public getAppointmentsByCase = async (req: Request, res: Response): Promise<void> => {
        try {
            const { caseId } = req.params;

            const appointments = await this.administrativeAppointmentService.getAppointmentsByCase(caseId);

            res.status(HttpStatus.Success).json(formatResponse(appointments, true, 'Case appointments retrieved successfully'));
        } catch (error: any) {
            console.error('Error fetching case appointments:', error);
            throw new HttpException(HttpStatus.InternalServerError, error.message || 'Error fetching case appointments');
        }
    };

    /**
     * Update appointment progress and case status
     */
    public updateAppointmentProgress = async (req: Request, res: Response): Promise<void> => {
        try {
            const { appointmentId } = req.params;

            // Validate DTO
            const dto = plainToClass(UpdateAppointmentProgressDto, req.body);
            await validateOrReject(dto);

            await this.administrativeAppointmentService.updateAdministrativeCaseProgress(appointmentId, dto.status as AppointmentStatusEnum);

            res.status(HttpStatus.Success).json(formatResponse(null, true, 'Appointment progress updated successfully'));
        } catch (error: any) {
            console.error('Error updating appointment progress:', error);
            throw new HttpException(HttpStatus.InternalServerError, error.message || 'Error updating appointment progress');
        }
    };

    /**
     * Validate appointment creation for a case
     */
    public validateAppointmentCreation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { caseId } = req.params;

            const validation = await this.administrativeAppointmentService.validateAppointmentCreation(caseId);

            res.status(HttpStatus.Success).json(formatResponse(validation, true, 'Validation completed'));
        } catch (error: any) {
            console.error('Error validating appointment creation:', error);
            throw new HttpException(HttpStatus.InternalServerError, error.message || 'Error validating appointment creation');
        }
    };
}
