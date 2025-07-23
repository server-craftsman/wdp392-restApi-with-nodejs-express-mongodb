import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IAddress } from '../user.interface';
export default class UpdateUserDto {
    constructor(
        first_name: string,
        last_name: string,
        phone_number: string,
        avatar_url: string,
        dob: Date | string,
        address: IAddress,
        gender: string
    ) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.phone_number = phone_number;
        this.avatar_url = avatar_url;
        this.dob = dob;
        this.address = {
            street: address.street,
            ward: address.ward,
            district: address.district,
            city: address.city,
            country: address.country
        };
        this.gender = gender;
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

    @IsString()
    @IsOptional()
    public address: IAddress;

    @IsString()
    @IsOptional()
    public gender: string;
}
