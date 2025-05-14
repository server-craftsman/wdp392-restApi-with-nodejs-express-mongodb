import { IsIn, IsNotEmpty } from "class-validator";
import { UserRoles } from "../user.constant";
import { UserRole } from "../user.interface";

export default class ChangeRoleDto {
    constructor(user_id: string, role: UserRole) {
        this.user_id = user_id;
        this.role = role;
    }

    @IsNotEmpty()
    public user_id: string;

    @IsIn(UserRoles)
    public role: UserRole;
}
