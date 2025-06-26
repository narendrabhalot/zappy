import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { mongooseGlobalTransformPlugin } from '../common/utils/mongoose-global-transform.plugin';

// ✅ Add this interface for the instance method
export interface UserDocument extends User, Document {
    isComparePassword(enteredPassword: string): Promise<boolean>;
}

@Schema({ timestamps: true, versionKey: false })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, unique: true })
    mobile: number;

    @Prop()
    refreshToken?: string;

    @Prop({ default: 0 })
    tokenVersion: number;

    @Prop({
        type: [{ token: String, device: String, lastUsed: Date }],
        default: [],
    })
    activeSessions: Array<{
        token: string;
        device: string;
        lastUsed: Date;
    }>;

    @Prop({ required: true, enum: ['user', 'admin', 'vendor'], default: 'user' })
    role: string;

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ default: false })
    isMobileVerify?: boolean;

    @Prop({ default: false })
    isEmailVerify?: boolean;

    async isPasswordMatch(inputPassword: string): Promise<boolean> {
        return bcrypt.compare(inputPassword, this.password);
    }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ mobile: 1 }, { unique: true });
// 🔐 Pre-save hook for hashing password
UserSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// ✅ Instance method for comparing passwords
UserSchema.methods.isComparePassword = async function (
    enteredPassword: string,
): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.plugin(mongooseGlobalTransformPlugin);
