import { SampleMethod, ServiceType } from "../service.interface";
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from "class-validator";
import { ServiceTypeEnum, SampleMethodEnum } from "../service.enum";
import { Type } from "class-transformer";

export default class UpdateServiceDto {
    constructor(
        name: string,
        description: string,
        parent_service_id: string | null,
        price: number,
        type: ServiceType,
        sample_method: SampleMethod,
        estimated_time: number,
        image_url?: string,
        slug?: string,
    ) {
        this.name = name;
        this.description = description;
        this.parent_service_id = parent_service_id;
        this.price = price;
        this.type = type;
        this.sample_method = sample_method;
        this.estimated_time = estimated_time;
        this.image_url = image_url;
        this.slug = slug;
    }

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    parent_service_id: string | null;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    price: number;

    @IsEnum(ServiceTypeEnum)
    @IsNotEmpty()
    type: ServiceType;

    @IsEnum(SampleMethodEnum)
    @IsNotEmpty()
    sample_method: SampleMethod;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    estimated_time: number;

    @IsString()
    @IsOptional()
    image_url?: string;
}

