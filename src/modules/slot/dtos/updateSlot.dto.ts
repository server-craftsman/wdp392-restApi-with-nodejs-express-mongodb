import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import mongoose, { Schema } from 'mongoose';
import { TimePointDto, TimeSlotDto } from './createSlot.dto';

export class UpdateSlotDto {
    constructor(staff_profile_ids: string[], time_slots: TimeSlotDto[], appointment_limit: number, status?: string) {
        this.staff_profile_ids = staff_profile_ids;
        this.time_slots = time_slots;
        this.appointment_limit = appointment_limit;
        this.status = status;
    }

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    staff_profile_ids: string[];

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlotDto)
    time_slots: TimeSlotDto[];

    @IsNotEmpty()
    @IsNumber()
    appointment_limit: number;

    @IsOptional()
    @IsString()
    status?: string;
}
