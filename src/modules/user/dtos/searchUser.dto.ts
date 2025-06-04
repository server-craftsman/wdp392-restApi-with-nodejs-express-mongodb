import { IsBoolean, IsIn, IsString, IsArray } from 'class-validator';
import { UserRoles } from '../user.constant';
import { UserRole } from '../user.interface';
import { UserRoleEnum } from '../user.enum';

export default class SearchUserDto {
    constructor(
        keyword: string = '',
        role: UserRole[] | string[] = [],
        status: boolean = true,
        is_verified: boolean | string = '',
        is_deleted: boolean = false,
    ) {
        this.keyword = keyword;
        this.role = role;
        this.status = status;
        this.is_verified = is_verified;
        this.is_deleted = is_deleted;
    }

    @IsString()
    public keyword: string;

    @IsArray()
    public role: UserRole[] | string[];

    public is_verified: boolean | string;

    @IsBoolean()
    public status: boolean;

    @IsBoolean()
    public is_deleted: boolean;
}
