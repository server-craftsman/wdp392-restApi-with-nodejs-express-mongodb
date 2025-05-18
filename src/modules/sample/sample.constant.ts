import { SampleStatusEnum, SampleTypeEnum } from './sample.enum';
import { CollectionMethodEnum } from '../appointment/appointment.enum';

export const SampleTypes = [
    '',
    SampleTypeEnum.SALIVA,
    SampleTypeEnum.BLOOD,
    SampleTypeEnum.HAIR,
    SampleTypeEnum.OTHER
];

export const SampleStatuses = [
    '',
    SampleStatusEnum.PENDING,
    SampleStatusEnum.RECEIVED,
    SampleStatusEnum.TESTING,
    SampleStatusEnum.COMPLETED,
    SampleStatusEnum.INVALID
];

export const CollectionMethods = [
    '',
    CollectionMethodEnum.SELF,
    CollectionMethodEnum.FACILITY,
    CollectionMethodEnum.HOME
]; 