import { IsNotEmpty, IsString, IsDateString, IsEnum, ValidateNested, IsArray, IsNumber } from "class-validator";
import { SlotPattern } from "../slot.interface";
import type { ITimeSlot } from "../slot.interface";
import { Type } from "class-transformer";
import TimeSlotDto from "./timeSlot.dto";

export class CreateMultipleSlotsDto {
    constructor(
        staff_profile_id: string,
        service_id: string,
        pattern: SlotPattern,
        start_date: Date,
        end_date: Date,
        time_slots: ITimeSlot,
        days_of_week: number[],
        appointment_limit: number
    ) {
        this.staff_profile_id = staff_profile_id;
        this.service_id = service_id;
        this.pattern = pattern;
        this.start_date = start_date;
        this.end_date = end_date;
        this.time_slots = time_slots;
        this.days_of_week = days_of_week;
        this.appointment_limit = appointment_limit;
    }

    @IsNotEmpty()
    @IsString()
    staff_profile_id: string;

    @IsNotEmpty()
    @IsString()
    service_id: string;

    @IsNotEmpty()
    @IsEnum(SlotPattern)
    pattern: SlotPattern;

    @IsNotEmpty()
    @Type(() => Date)
    start_date: Date;

    @IsNotEmpty()
    @Type(() => Date)
    end_date: Date;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlotDto)
    time_slots: TimeSlotDto;

    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true }) // Ensure each element in the array is a number
    days_of_week: number[]; // 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday

    @IsNotEmpty()
    @IsNumber()
    appointment_limit: number;
}
