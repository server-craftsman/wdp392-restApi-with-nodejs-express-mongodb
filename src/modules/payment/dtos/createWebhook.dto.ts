import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWebhookDto {
    @IsNotEmpty()
    @IsString()
    payment_no: string | undefined;

    @IsOptional()
    @IsString()
    amount: string | undefined;

    @IsNotEmpty()
    @IsString()
    status: string | undefined;

    @IsNotEmpty()
    @IsString()
    signature: string | undefined;
}
