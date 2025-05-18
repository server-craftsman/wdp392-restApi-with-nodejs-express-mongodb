import { AppointmentStatusEnum, CollectionMethodEnum } from './appointment.enum';

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

export const CollectionMethods = [
    '',
    CollectionMethodEnum.SELF,
    CollectionMethodEnum.FACILITY,
    CollectionMethodEnum.HOME
]; 