import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenService {
    private readonly MAX_ACTIVE_SESSIONS = 5;

    constructor(
        private jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    async generateTokens(user: UserDocument, device: string) {
        const newTokenVersion = user.tokenVersion + 1;
        const payload = {
            email: user.email,
            sub: user._id,
            tokenVersion: newTokenVersion,
            device,
            role: user.role,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.generateAccessToken(payload),
            this.generateRefreshToken(payload),
        ]);

        // Hash and store refresh token
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.updateUserSessions(user, hashedRefreshToken, device, newTokenVersion);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async verifyRefreshToken(refreshToken: string) {
        try {
            return await this.jwtService.verifyAsync(refreshToken);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async validateSession(user: UserDocument, refreshToken: string, tokenVersion: number) {
        const session = user.activeSessions.find(s =>
            bcrypt.compareSync(refreshToken, s.token)
        );

        if (!session || tokenVersion !== user.tokenVersion) {
            throw new UnauthorizedException('Invalid or expired session');
        }

        return session;
    }

    async updateUserSessions(
        user: UserDocument,
        hashedToken: string,
        device: string,
        newTokenVersion: number
    ) {
        const activeSessions = [...(user.activeSessions || [])];

        if (activeSessions.length >= this.MAX_ACTIVE_SESSIONS) {
            activeSessions.shift(); // Remove oldest session
        }

        activeSessions.push({
            token: hashedToken,
            device,
            lastUsed: new Date(),
        });

        await this.userModel.updateOne(
            { _id: user._id },
            {
                $set: {
                    tokenVersion: newTokenVersion,
                    activeSessions,
                },
            }
        );
    }

    async invalidateUserSessions(userId: string, allSessions: boolean = false) {
        if (allSessions) {
            return this.userModel.updateOne(
                { _id: userId },
                {
                    $set: { activeSessions: [] },
                    $inc: { tokenVersion: 1 }
                }
            );
        }
        return this.userModel.updateOne(
            { _id: userId },
            { $inc: { tokenVersion: 1 } }
        );
    }

    private async generateAccessToken(payload: any) {
        return this.jwtService.signAsync(payload, {
            expiresIn: '15m'
        });
    }

    private async generateRefreshToken(payload: any) {
        return this.jwtService.signAsync(payload, {
            expiresIn: '7d'
        });
    }
}