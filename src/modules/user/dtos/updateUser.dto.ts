import { IsDate, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { IAddress } from '../user.interface';

export default class UpdateUserDto {
    @IsString()
    @IsOptional()
    public first_name?: string;

    @IsString()
    @IsOptional()
    public last_name?: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            const num = parseInt(value, 10);
            return isNaN(num) ? value : num;
        }
        return value;
    })
    public phone_number?: number;

    @IsString()
    @IsOptional()
    public avatar_url?: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    public dob?: Date | string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    })
    public address?: IAddress | string;

    @IsString()
    @IsOptional()
    public gender?: string;
}
