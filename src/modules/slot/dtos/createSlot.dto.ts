import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ITimeSlot, TimePoint } from '../slot.interface';

export class TimePointDto implements TimePoint {
    constructor(hour: number, minute: number) {
        this.hour = hour;
        this.minute = minute;
    }

    @IsNotEmpty()
    @IsNumber()
    hour: number;

    @IsNotEmpty()
    @IsNumber()
    minute: number;
}

export class TimeSlotDto implements ITimeSlot {
    constructor(year: number, month: number, day: number, start_time: TimePointDto, end_time: TimePointDto) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.start_time = start_time;
        this.end_time = end_time;
    }

    @IsNotEmpty()
    @IsNumber()
    year: number;

    @IsNotEmpty()
    @IsNumber()
    month: number;

    @IsNotEmpty()
    @IsNumber()
    day: number;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => TimePointDto)
    start_time: TimePointDto;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => TimePointDto)
    end_time: TimePointDto;
}

export class CreateSlotDto {
    constructor(staff_profile_ids: string[], time_slots: TimeSlotDto[], appointment_limit: number) {
        this.staff_profile_ids = staff_profile_ids;
        this.time_slots = time_slots;
        this.appointment_limit = appointment_limit;
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
}
