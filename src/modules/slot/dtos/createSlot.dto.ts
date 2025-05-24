import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, IsArray } from "class-validator";
import { SlotPattern } from "../slot.interface";

export class CreateSlotDto {
    constructor(
        staff_profile_ids: string[],
        service_id: string,
        start_time: Date,
        end_time: Date,
        appointment_limit: number,
        pattern?: SlotPattern,
        days_of_week?: number[],
    ) {
        this.staff_profile_ids = staff_profile_ids;
        this.service_id = service_id;
        this.start_time = start_time;
        this.end_time = end_time;
        this.appointment_limit = appointment_limit;
        this.pattern = pattern || SlotPattern.DAILY;
        this.days_of_week = days_of_week || [0, 1, 2, 3, 4, 5, 6];
    }

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true }) // each: true is used to validate each element in the array
    staff_profile_ids: string[];

    @IsNotEmpty()
    @IsString()
    service_id: string;

    @IsNotEmpty()
    @Type(() => Date)
    start_time: Date;

    @IsNotEmpty()
    @Type(() => Date)
    end_time: Date;

    @IsNotEmpty()
    @IsNumber()
    appointment_limit: number;

    @IsOptional()
    @IsEnum(SlotPattern)
    pattern?: SlotPattern;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    days_of_week?: number[];
} 