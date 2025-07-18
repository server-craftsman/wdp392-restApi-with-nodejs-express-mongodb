import { IsArray, IsBoolean, IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BlogImageDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    image_url!: string;

    @IsOptional()
    @IsDate()
    created_at?: Date;
}

export class UploadBlogImagesDto {
    @IsMongoId()
    @IsNotEmpty()
    blog_id!: string;
}

export class CreateBlogDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsMongoId()
    @IsOptional()
    user_id?: string;

    @IsMongoId()
    @IsNotEmpty()
    service_id!: string;

    @IsMongoId()
    @IsNotEmpty()
    blog_category_id!: string;

    @Type(() => Boolean)
    @IsOptional()
    is_published?: boolean;

    @IsOptional()
    @Type(() => Date)
    published_at?: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BlogImageDto)
    @IsOptional()
    images?: BlogImageDto[];

    // This field is not validated by class-validator as it will be handled by multer
    files?: Express.Multer.File[];
}

export class UpdateBlogDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsMongoId()
    @IsOptional()
    user_id?: string;

    @IsMongoId()
    @IsOptional()
    service_id?: string;

    @IsMongoId()
    @IsOptional()
    blog_category_id?: string;

    @Type(() => Boolean)
    @IsOptional()
    is_published?: boolean;

    @IsOptional()
    @Type(() => Date)
    published_at?: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BlogImageDto)
    @IsOptional()
    images?: BlogImageDto[];

    // This field is not validated by class-validator as it will be handled by multer
    files?: Express.Multer.File[];
}

export class BlogResponseDto {
    id!: string;
    title!: string;
    content!: string;
    slug!: string;
    user_id!: string;
    service_id!: string;
    blog_category_id!: string;
    is_published!: boolean;
    published_at?: Date;
    images!: BlogImageDto[];
    created_at!: Date;
    updated_at!: Date;
}

export class BlogSearchDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    blog_category_id?: string;

    @IsString()
    @IsOptional()
    user_id?: string;

    @IsString()
    @IsOptional()
    service_id?: string;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    is_published?: boolean;
} 