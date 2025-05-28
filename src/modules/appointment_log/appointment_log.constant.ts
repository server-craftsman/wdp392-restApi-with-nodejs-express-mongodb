import { AppointmentLogTypeEnum } from './appointment_log.enum';

export const AppointmentLogTypes = [
    '',
    AppointmentLogTypeEnum.PENDING,
    AppointmentLogTypeEnum.CONFIRMED,
    AppointmentLogTypeEnum.SAMPLE_COLLECTED,
    AppointmentLogTypeEnum.TESTING,
    AppointmentLogTypeEnum.COMPLETED,
    AppointmentLogTypeEnum.CANCELLED
];
