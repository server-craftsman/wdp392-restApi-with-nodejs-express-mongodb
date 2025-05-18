import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IDepartment } from './department.interface';

const DepartmentSchemaEntity: Schema<IDepartment> = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    manager_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const DepartmentSchema = mongoose.model<IDepartment & mongoose.Document>(
    COLLECTION_NAME.DEPARTMENT,
    DepartmentSchemaEntity
);

export default DepartmentSchema; 