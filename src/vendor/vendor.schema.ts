import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {mongooseGlobalTransformPlugin} from '../common/utils/mongoose-global-transform.plugin'
export type VendorDocument = Vendor & Document;

@Schema({ timestamps: true })
export class Vendor {
    // Step 1: Personal Info
    @Prop({ required: true, trim: true })
    firstName: string;

    @Prop({ required: true, trim: true })
    lastName: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true, unique: true, trim: true })
    mobile: number;

    @Prop({ required: true, minlength: 6, select: false })
    password: string;

    @Prop({ enum: ['vendor'], default: 'vendor' })
    role: string;


    @Prop({ default: false })
    isMobileVerify?: boolean;

    @Prop({ default: false })
    isEmailVerify?: boolean;

    // Step 2: Business Info
    @Prop({ trim: true })
    businessName?: string;

    @Prop()
    businessType?: string;

    @Prop()
    experience?: string;

    @Prop({ type: Types.ObjectId, ref: 'City' })
    primaryCity?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'State' })
    state?: Types.ObjectId;

    @Prop()
    zip?: string;

    @Prop()
    businessAddress?: string;

    @Prop()
    businessDescription?: string;



    // Step 3: Services & Terms
    @Prop({ type: [String], default: [] })
    servicesOffered?: string[];

    @Prop({ default: false })
    agreeToTerms?: boolean;

    @Prop({ default: false })
    consent?: boolean;

    // Status Control
    @Prop({ enum: ['draft', 'in_progress', 'complete'], default: 'draft' })
    registrationStatus?: string;

    // Utility method to match password
    static async isPasswordMatch(
        inputPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(inputPassword, hashedPassword);
    }
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

// 🔒 Pre-save hook to hash password
// Hook with dynamic salt rounds
VendorSchema.pre<VendorDocument>('save', async function (next) {
    if (!this.isModified('password')) return next();

    // Use default fallback if ENV is not available
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});


VendorSchema.plugin(mongooseGlobalTransformPlugin);