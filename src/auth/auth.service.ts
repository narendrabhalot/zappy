// src/auth/auth.service.ts

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateVendorDtoStep1 } from './dto/create-vendor.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserDocument } from '../users/users.schema';
import { TokenService } from '../services/token.service';
import { UsersService } from '../users/users.service';
import { VendorService } from '../vendor/vendor.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    // @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly vendorService: VendorService,
  ) { }

  async register(createUserDto: CreateUserDto) {
    let user = await this.usersService.createUser(createUserDto)
    return user

  }
  async registerVendor(createVendorDto: CreateVendorDtoStep1) {
    // Optional: You can normalize or trim email before saving
    createVendorDto.email = createVendorDto.email.trim().toLowerCase();
    const vendor = await this.vendorService.createVendor(createVendorDto);
    return vendor;
  }
  async login(loginDto: LoginDto, req: Request) {
    const { email, password } = loginDto;
    let user = await this.usersService.findUserByEmail(email)
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await user.isComparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const device = this.getDeviceInfo(req);
    const tokens = await this.tokenService.generateTokens(user, device);
    const { password: _, ...userDetails } = user.toObject();

    return {
      message: 'Login successful',
      ...tokens,
      user: userDetails,
    };
  }

  async refreshToken(refreshToken: string, req: Request) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.tokenService.validateSession(
      user,
      refreshToken,
      payload.tokenVersion,
    );
    const device = this.getDeviceInfo(req);

    return await this.tokenService.generateTokens(user, device);
  }

  async logout(refreshToken: string, allDevices = false) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    await this.tokenService.invalidateUserSessions(payload.sub, allDevices);

    return {
      message: allDevices
        ? 'Logged out from all devices'
        : 'Logged out successfully',
    };
  }

  async verifyMobileOtp(verifyOtpDto: VerifyOtpDto, req: Request) {
    const { mobile, otp, role } = verifyOtpDto;
    // TODO: Replace with real OTP verification logic
    const isOtpValid = otp === '123456'; // Mock: Accept only '123456' as valid OTP
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP');
    }
    // Find user or vendor by mobile based on role
    let entity;
    if (role === 'vendor') {
      entity = await this.vendorService.findVendorByMobile(mobile);
      if (!entity) {
        throw new UnauthorizedException('Vendor not found');
      }
    } else {
      entity = await this.usersService.findUserByMobile(mobile);
      if (!entity) {
        throw new UnauthorizedException('User not found');
      }
    }
    // Update isMobileVerify to true
    entity.isMobileVerify = true;
    // Ensure tokenVersion is a valid number
    if (typeof entity.tokenVersion !== 'number' || isNaN(entity.tokenVersion)) {
      entity.tokenVersion = 0;
    }
    await entity.save();
    const device = this.getDeviceInfo(req);
    const tokens = await this.tokenService.generateTokens(entity, device);
    const { password: _, ...entityDetails } = entity.toObject();
    return {
      message: 'OTP verified successfully',
      ...tokens,
      user: entityDetails,
    };
  }

  private getDeviceInfo(req: Request): string {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `${userAgent} (${ip})`;
  }
}
