import { IsNotEmpty, MinLength } from 'class-validator';

export default class ChangePasswordDto {
    constructor(user_id: string, old_password: string, new_password: string) {
        this.user_id = user_id;
        this.old_password = old_password;
        this.new_password = new_password;
    }

    @IsNotEmpty()
    public user_id: string;

    @IsNotEmpty()
    @MinLength(6)
    public old_password: string;

    @IsNotEmpty()
    @MinLength(6)
    public new_password: string;
}
