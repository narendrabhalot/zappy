import { IsNumber, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class VerifyOtpDto {
    @IsNumber()
    @IsNotEmpty()
    mobile: number;

    @IsNotEmpty()
    otp: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['user', 'admin', 'vendor'])
    role: string;
}