import { IsArray, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IQualification } from "../staff_profile.interface";
import { Type } from "class-transformer";

export default class UpdateStaffProfileDto {
    constructor(
        user_id: string,
        department_id: string,
        job_title: string,
        hire_date: Date,
        salary: number,
        qualifications: IQualification[]
    ) {
        this.user_id = user_id;
        this.department_id = department_id;
        this.job_title = job_title;
        this.hire_date = hire_date;
        this.salary = salary;
        this.qualifications = qualifications;
    }

    @IsNotEmpty()
    @IsString()
    public user_id: string;

    @IsNotEmpty()
    @IsString()
    public department_id: string;

    @IsNotEmpty()
    @IsString()
    public job_title: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    public hire_date: Date;

    @IsNotEmpty()
    @IsNumber()
    public salary: number;

    @IsNotEmpty()
    @IsArray()
    public qualifications: IQualification[];
}
