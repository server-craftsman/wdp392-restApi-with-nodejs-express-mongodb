import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UploadPersonImageDto {
    @IsNotEmpty()
    @IsMongoId()
    sample_id: string = '';
}
