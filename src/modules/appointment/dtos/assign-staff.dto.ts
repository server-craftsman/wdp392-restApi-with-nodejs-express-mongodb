import { IsMongoId, IsArray } from 'class-validator';

export class AssignStaffDto {
    @IsArray()
    @IsMongoId({ each: true })
    staff_ids: string[] = [];
} 