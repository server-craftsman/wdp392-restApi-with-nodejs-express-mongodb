import { Document, Schema } from 'mongoose';
import { SampleStatusEnum, SampleTypeEnum } from './sample.enum';
import { CollectionMethodEnum } from './sample.enum';

export type SampleType =
    SampleTypeEnum.SALIVA |
    SampleTypeEnum.BLOOD |
    SampleTypeEnum.HAIR |
    SampleTypeEnum.OTHER;

export type SampleStatus =
    SampleStatusEnum.PENDING |
    SampleStatusEnum.RECEIVED |
    SampleStatusEnum.TESTING |
    SampleStatusEnum.COMPLETED |
    SampleStatusEnum.INVALID;

export type CollectionMethod =
    CollectionMethodEnum.SELF |
    CollectionMethodEnum.FACILITY |
    CollectionMethodEnum.HOME;

export interface ISample extends Document {
    _id: string;
    appointment_id: Schema.Types.ObjectId;
    kit_id: Schema.Types.ObjectId;
    type: SampleType | null;
    collection_method: CollectionMethod;
    collection_date: Date;
    received_date?: Date;
    status: SampleStatus;
    created_at: Date;
    updated_at: Date;
} 