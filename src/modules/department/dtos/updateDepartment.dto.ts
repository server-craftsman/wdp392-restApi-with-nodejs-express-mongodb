import { IsNotEmpty, IsString } from 'class-validator';

export default class UpdateDepartmentDto {
    constructor(name: string, description: string, manager_id: string) {
        this.name = name;
        this.description = description;
        this.manager_id = manager_id;
    }

    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsString()
    @IsNotEmpty()
    public description: string;

    @IsString()
    @IsNotEmpty()
    public manager_id: string;
}
