import { Controller, Get, Post, Body, HttpCode, ValidationError, UseFilters, BadRequestException, UseGuards, Req, Query } from "@nestjs/common";
import { CreateUserDto } from './dto/create-user.dto';
import { CreateVendorDtoStep1 } from './dto/create-vendor.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { AuthService } from './auth.service';
import logger from '../common/utils/logger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
        logger.info('AuthController initialized');
    }

    @Post('register-user')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully created' })
    @UseFilters(HttpExceptionFilter)
    async register(@Body() createUserDto: CreateUserDto) {
        logger.info('POST /auth/register endpoint hit', { dto: createUserDto });
        return this.authService.register(createUserDto);
    }
    @Post('register-vendor')
    @ApiOperation({ summary: 'Register a new vendor' })
    @ApiResponse({ status: 201, description: 'Vendor successfully created' })
    @UseFilters(HttpExceptionFilter)
    async registerVendor(@Body() createVendorDto: CreateVendorDtoStep1) {
        logger.info('POST /auth/register-vendor endpoint hit', { dto: createVendorDto });
        return this.authService.registerVendor(createVendorDto);
    }

    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        return this.authService.login(loginDto, req);
    }

    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refresh successful' })
    async refreshToken(
        @Body('refresh_token') refreshToken: string,
        @Req() req: Request
    ) {
        return this.authService.refreshToken(refreshToken, req);
    }

    @Post('logout')
    @HttpCode(200)
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @ApiQuery({ name: 'all_devices', required: false, type: Boolean })
    async logout(
        @Body('refresh_token') refreshToken: string,
        @Query('all_devices') allDevices?: boolean
    ) {
        return this.authService.logout(refreshToken, allDevices);
    }

    @Post('verify-mobile-otp')
    @ApiOperation({ summary: 'Verify mobile OTP and generate token' })
    @ApiResponse({ status: 200, description: 'OTP verified and token generated' })
    async verifyMobileOtp(@Body() verifyOtpDto: VerifyOtpDto, @Req() req: Request) {
        return this.authService.verifyMobileOtp(verifyOtpDto, req);
    }
}
