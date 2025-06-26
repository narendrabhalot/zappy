import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from '../services/token.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module'; // ✅ FIXED: Import UsersModule
import logger from '../common/utils/logger';
import { User, UserSchema } from '../users/users.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorModule } from 'src/vendor/vendor.module';

@Module({
  imports: [
    UsersModule, // ✅ Make sure UsersModule is imported here
    VendorModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key', // Use environment variable in production
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy, RolesGuard],
  exports: [AuthService, TokenService]
})
export class AuthModule {
  constructor() {
    logger.info('AuthModule initialized');
  }
}