import { IsArray, IsDate, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { IQualification } from '../staff_profile.interface';
import { Type } from 'class-transformer';
import { IAddress } from '../../user/user.interface';

export default class CreateStaffProfileDto {
    constructor(user_id: string, department_id: string, job_title: string, hire_date: Date, address: IAddress, salary: number, qualifications: IQualification[] = []) {
        this.user_id = user_id;
        this.department_id = department_id;
        this.job_title = job_title;
        this.hire_date = hire_date;
        this.address = address;
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
    @IsObject()
    public address: IAddress;

    @IsNotEmpty()
    @IsNumber()
    public salary: number;

    @IsOptional()
    @IsArray()
    public qualifications: IQualification[] = [];

    // Các trường sau sẽ được tạo tự động trong service
    // employee_id: string;
    // status: string;
}
