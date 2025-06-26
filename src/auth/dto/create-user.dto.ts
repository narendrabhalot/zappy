// src/auth/dto/create-user.dto.ts

import { IsEmail, IsNumber, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsNumber()
    @IsNotEmpty()
    mobile: number;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;


    @IsOptional()
    @IsString()
    @IsIn(['user', 'admin', 'vendor'])
    role?: string; // Optional (user/admin/vendor)
}
