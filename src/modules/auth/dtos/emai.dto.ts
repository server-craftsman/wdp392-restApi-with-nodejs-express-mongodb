import { IsEmail, IsNotEmpty } from 'class-validator';

export default class EmailDto {
    constructor(email: string) {
        this.email = email;
    }

    @IsNotEmpty()
    @IsEmail()
    public email: string;
}
