import { IsArray, IsBoolean, IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BlogImageDto } from '../../dtos/blog.dto';

export class CreateLogDto {
    @IsMongoId()
    @IsNotEmpty()
    blog_id!: string;

    @IsMongoId()
    @IsNotEmpty()
    author_id!: string;

    @IsString()
    @IsOptional()
    old_title?: string;

    @IsString()
    @IsOptional()
    new_title?: string;

    @IsString()
    @IsOptional()
    old_content?: string;

    @IsString()
    @IsOptional()
    new_content?: string;

    @IsString()
    @IsOptional()
    old_slug?: string;

    @IsString()
    @IsOptional()
    new_slug?: string;

    @IsMongoId()
    @IsOptional()
    old_blog_category_id?: string;

    @IsMongoId()
    @IsOptional()
    new_blog_category_id?: string;

    @IsMongoId()
    @IsOptional()
    old_service_id?: string;

    @IsMongoId()
    @IsOptional()
    new_service_id?: string;

    @IsMongoId()
    @IsOptional()
    old_user_id?: string;

    @IsMongoId()
    @IsOptional()
    new_user_id?: string;

    @IsBoolean()
    @IsOptional()
    old_is_published?: boolean;

    @IsBoolean()
    @IsOptional()
    new_is_published?: boolean;

    @IsDate()
    @IsOptional()
    old_published_at?: Date;

    @IsDate()
    @IsOptional()
    new_published_at?: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BlogImageDto)
    @IsOptional()
    old_images?: BlogImageDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BlogImageDto)
    @IsOptional()
    new_images?: BlogImageDto[];
}

export class LogResponseDto {
    id!: string;
    blog_id!: string;
    author_id!: string;
    old_title?: string;
    new_title?: string;
    old_content?: string;
    new_content?: string;
    old_slug?: string;
    new_slug?: string;
    old_blog_category_id?: string;
    new_blog_category_id?: string;
    old_service_id?: string;
    new_service_id?: string;
    old_user_id?: string;
    new_user_id?: string;
    old_is_published?: boolean;
    new_is_published?: boolean;
    old_published_at?: Date;
    new_published_at?: Date;
    old_images?: BlogImageDto[];
    new_images?: BlogImageDto[];
    created_at!: Date;
    updated_at!: Date;
}

export class LogSearchDto {
    @IsMongoId()
    @IsOptional()
    blog_id?: string;

    @IsMongoId()
    @IsOptional()
    author_id?: string;

    @IsDate()
    @IsOptional()
    created_at_from?: Date;

    @IsDate()
    @IsOptional()
    created_at_to?: Date;
} 