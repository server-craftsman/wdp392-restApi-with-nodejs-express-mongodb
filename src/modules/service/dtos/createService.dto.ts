import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { IService, SampleMethod, ServiceType } from "../service.interface";

export default class CreateServiceDto {
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
    public name: string;

    @IsString()
    @IsNotEmpty()
    public description: string;

    @IsString()
    @IsOptional()
    public parent_service_id: string;

    @IsNumber()
    @IsNotEmpty()
    public price: number;

    @IsString()
    @IsNotEmpty()
    public type: ServiceType;

    @IsString()
    @IsNotEmpty()
    public sample_method: SampleMethod;

    @IsNumber()
    @IsNotEmpty()
    public estimated_time: number;
}
