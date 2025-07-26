import { IsBoolean, IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlogCategoryDto {
    @IsString()
    @IsNotEmpty()
    name!: string;
}

export class UpdateBlogCategoryDto {
    @IsString()
    @IsOptional()
    name?: string;
}

export class BlogCategoryResponseDto {
    id!: string;
    name!: string;
    created_at!: Date;
    updated_at!: Date;
}

export class BlogCategorySearchDto {
    @IsString()
    @IsOptional()
    name?: string;
}
