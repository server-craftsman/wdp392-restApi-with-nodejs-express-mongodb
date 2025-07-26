import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IService, SampleMethod, ServiceType } from '../service.interface';
import { Type, Transform } from 'class-transformer';

export default class CreateServiceDto {
    constructor(
        name: string,
        description: string,
        parent_service_id: string | null,
        price: number,
        type: ServiceType,
        // sample_method: SampleMethod,
        estimated_time: number,
        image_url?: string,
        slug?: string,
    ) {
        this.name = name;
        this.description = description;
        this.parent_service_id = parent_service_id;
        this.price = price;
        this.type = type;
        // this.sample_method = sample_method;
        this.estimated_time = estimated_time;
        this.image_url = image_url;
        this.slug = slug || '';
    }

    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsString()
    @IsOptional()
    public slug: string;

    @IsString()
    @IsNotEmpty()
    public description: string;

    @IsString()
    @IsOptional()
    public parent_service_id: string | null;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    public price: number;

    @IsString()
    @IsNotEmpty()
    public type: ServiceType;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    public estimated_time: number;

    @IsString()
    @IsOptional()
    public image_url?: string;
}
