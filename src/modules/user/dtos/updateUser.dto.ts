import { IsNotEmpty, IsString } from 'class-validator';

export default class UpdateUserDto {
    constructor(
        name: string,
        description: string,
        phone_number: string,
        avatar_url: string,
        video_url: string,
        dob: Date | string,
        bank_account_name: string,
        bank_name: string,
    ) {
        this.name = name;
        this.description = description;
        this.phone_number = phone_number;
        this.avatar_url = avatar_url;
        this.video_url = video_url;
        this.dob = dob;
        this.bank_account_name = bank_account_name;
        this.bank_name = bank_name;
    }

    @IsNotEmpty()
    public name: string;

    @IsString()
    public description: string;

    @IsString()
    public phone_number: string;

    @IsString()
    public avatar_url: string;

    @IsString()
    public video_url: string;

    public dob: Date | string;

    public bank_account_name: string;
    public bank_name: string;
}
