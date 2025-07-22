import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyOTPDto {
    @IsString()
    @IsNotEmpty({ message: 'Phone number is required' })
    phone_number!: string;

    @IsString()
    @IsNotEmpty({ message: 'OTP is required' })
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    otp!: string;
} 