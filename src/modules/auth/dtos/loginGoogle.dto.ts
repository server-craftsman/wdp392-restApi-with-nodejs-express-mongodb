import { IsNotEmpty } from 'class-validator';

export default class LoginGoogleDto {
    constructor(google_id: string, email: string, password: string) {
        this.google_id = google_id;
        this.email = email;
        this.password = password;
    }

    @IsNotEmpty()
    public google_id: string;

    public email: string;

    public password: string;
}
