import { AppointmentStatusEnum, TypeEnum } from './appointment.enum';

export const AppointmentStatuses = [
    '',
    AppointmentStatusEnum.PENDING,
    AppointmentStatusEnum.CONFIRMED,
    AppointmentStatusEnum.SAMPLE_COLLECTED,
    AppointmentStatusEnum.SAMPLE_RECEIVED,
    AppointmentStatusEnum.TESTING,
    AppointmentStatusEnum.COMPLETED,
    AppointmentStatusEnum.CANCELLED
];

export const CollectionTypes = [
    '',
    TypeEnum.SELF,
    TypeEnum.FACILITY,
    TypeEnum.HOME
]; 