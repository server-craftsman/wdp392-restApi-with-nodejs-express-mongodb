import { IsNotEmpty, IsNumber } from 'class-validator';

export default class TimeSlotDto {
    constructor(start_hour: number, start_minute: number, end_hour: number, end_minute: number) {
        this.start_hour = start_hour;
        this.start_minute = start_minute;
        this.end_hour = end_hour;
        this.end_minute = end_minute;
    }

    @IsNotEmpty()
    @IsNumber()
    start_hour: number;

    @IsNotEmpty()
    @IsNumber()
    start_minute: number;

    @IsNotEmpty()
    @IsNumber()
    end_hour: number;

    @IsNotEmpty()
    @IsNumber()
    end_minute: number;
}
