import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateKitDto {
    constructor(code?: string) {
        this.code = code;
    }

    @IsOptional()
    @IsString({ message: 'Kit code must be a string' })
    // @Matches(/^KIT-\d{8}-\d{3}$/, {
    //     message: 'Kit code must follow the format KIT-YYYYMMDD-###',
    //     each: false
    // })
    code?: string;
}
