import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export default class UpdateUserDto {
    constructor(
        first_name: string,
        last_name: string,
        phone_number: string,
        avatar_url: string,
        dob: Date | string,
    ) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.phone_number = phone_number;
        this.avatar_url = avatar_url;
        this.dob = dob;
    }

    @IsNotEmpty()
    public first_name: string;

    @IsNotEmpty()
    public last_name: string;

    @IsString()
    public phone_number: string;

    @IsString()
    public avatar_url: string;

    @IsDate()
    @Type(() => Date)
    public dob: Date | string;

}
