import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IsNumber, IsString, IsArray } from "class-validator";
import { SlotPattern } from "../slot.interface";

export class UpdateSlotDto {
    constructor(
        staff_profile_ids: string[],
        service_id: string,
        start_time: Date,
        end_time: Date,
        appointment_limit: number,
        pattern?: SlotPattern,
        days_of_week?: number[],
        status?: string,
    ) {
        this.staff_profile_ids = staff_profile_ids;
        this.service_id = service_id;
        this.start_time = start_time;
        this.end_time = end_time;
        this.appointment_limit = appointment_limit;
        this.pattern = pattern;
        this.days_of_week = days_of_week;
        this.status = status;
    }

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
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

    @IsOptional()
    @IsString()
    status?: string;
}
