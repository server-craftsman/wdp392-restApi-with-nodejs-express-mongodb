import { SampleMethod, ServiceType } from "../service.interface";
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from "class-validator";
import { ServiceTypeEnum, SampleMethodEnum } from "../service.enum";

export default class UpdateServiceDto {
    constructor(
        name: string,
        description: string,
        parent_service_id: string,
        price: number,
        type: ServiceType,
        sample_method: SampleMethod,
        estimated_time: number,
    ) {
        this.name = name;
        this.description = description;
        this.parent_service_id = parent_service_id;
        this.price = price;
        this.type = type;
        this.sample_method = sample_method;
        this.estimated_time = estimated_time;
    }

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    parent_service_id: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsEnum(ServiceTypeEnum)
    @IsNotEmpty()
    type: ServiceType;

    @IsEnum(SampleMethodEnum)
    @IsNotEmpty()
    sample_method: SampleMethod;

    @IsNumber()
    @IsNotEmpty()
    estimated_time: number;
}

