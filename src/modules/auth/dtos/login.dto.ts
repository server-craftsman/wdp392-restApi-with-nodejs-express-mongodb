import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export default class LoginDto {
    constructor(google_id: string, email: string, password: string) {
        this.google_id = google_id || '';
        this.email = email;
        this.password = password;
    }

    public google_id: string;

    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @IsNotEmpty()
    @MinLength(6)
    public password: string;
}
