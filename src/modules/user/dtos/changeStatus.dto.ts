import { IsBoolean, IsNotEmpty } from 'class-validator';

export default class ChangeStatusDto {
    constructor(user_id: string, status: boolean) {
        this.user_id = user_id;
        this.status = status;
    }

    @IsNotEmpty()
    public user_id: string;

    @IsNotEmpty()
    @IsBoolean()
    public status: boolean;
}
