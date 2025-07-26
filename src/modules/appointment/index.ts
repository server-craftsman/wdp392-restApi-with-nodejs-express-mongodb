import AppointmentSchema from './appointment.model';
import { IAppointment, AppointmentStatus, CollectionType } from './appointment.interface';
import { AppointmentStatusEnum, TypeEnum } from './appointment.enum';
import { AppointmentStatuses, CollectionTypes } from './appointment.constant';
import { CollectionMethodEnum } from '../sample/sample.enum';
import AppointmentRoute from './appointment.route';
import ConsultationRoute from './consultation.route';
import AppointmentController from './appointment.controller';
import AppointmentService from './appointment.service';
import AppointmentRepository from './appointment.repository';
import { CreateAppointmentDto } from './dtos/createAppointment.dto';
import { CreateConsultationDto } from './dtos/createConsultation.dto';
import AdministrativeAppointmentController from './administrative-appointment.controller';
import AdministrativeAppointmentService from './administrative-appointment.service';

export {
    AppointmentSchema,
    IAppointment,
    AppointmentStatus,
    CollectionType,
    AppointmentStatusEnum,
    TypeEnum,
    CollectionMethodEnum,
    AppointmentStatuses,
    CollectionTypes,
    AppointmentRoute,
    ConsultationRoute,
    AppointmentController,
    AppointmentService,
    AppointmentRepository,
    CreateAppointmentDto,
    CreateConsultationDto,
    AdministrativeAppointmentController,
    AdministrativeAppointmentService,
};
