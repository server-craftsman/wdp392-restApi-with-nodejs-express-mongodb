import { IsMongoId } from 'class-validator';

export class AssignStaffDto {
    @IsMongoId()
    staff_id: string = '';
} 