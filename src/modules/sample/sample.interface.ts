import { Document, Schema } from 'mongoose';
import { SampleStatusEnum, SampleTypeEnum } from './sample.enum';
import { CollectionMethodEnum } from './sample.enum';

export type SampleType = SampleTypeEnum.SALIVA | SampleTypeEnum.BLOOD | SampleTypeEnum.HAIR | SampleTypeEnum.OTHER;

export type SampleStatus = SampleStatusEnum.PENDING | SampleStatusEnum.RECEIVED | SampleStatusEnum.TESTING | SampleStatusEnum.COMPLETED | SampleStatusEnum.INVALID;

export type CollectionMethod = CollectionMethodEnum.SELF | CollectionMethodEnum.FACILITY | CollectionMethodEnum.HOME;

export interface IPersonInfo {
    name: string;
    dob?: Date;
    relationship?: string;
    birth_place?: string;
    nationality?: string;
    identity_document?: string;
    image_url?: string;
}

export interface ISample extends Document {
    _id: string;
    appointment_id: string | undefined;
    kit_id: string | undefined;
    type: SampleType | null;
    collection_method: CollectionMethod;
    collection_date: Date;
    received_date?: Date;
    status: SampleStatus;
    person_info?: IPersonInfo;
    person_info_list?: IPersonInfo[];
    created_at: Date;
    updated_at: Date;
    created_by?: string;
    updated_by?: string;
}
