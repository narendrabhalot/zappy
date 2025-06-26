import {
    IsEmail,
    IsString,
    IsNotEmpty,
    MinLength,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsArray,
    IsIn,
    IsMongoId,
    IsDefined,
    ArrayNotEmpty,
} from 'class-validator';
import { Types } from 'mongoose'
export class CreateVendorDtoStep2 {

    @IsString()
    businessName: string;

    @IsString()

    businessType: string;

    @IsString()
    experience: string;

    @IsMongoId({ message: 'primaryCity must be a valid ObjectId' })
    primaryCity: Types.ObjectId;

    @IsMongoId({ message: 'state must be a valid ObjectId' })
    state: Types.ObjectId;

    @IsString()
    zip: string;

    @IsString()
    businessAddress: string;

    @IsString()
    businessDescription: string;

    @IsBoolean()
    @IsOptional()
    isBussinessInfo: boolean;

    
    @IsOptional()
    @IsIn(['draft', 'in_progress', 'complete'])
    registrationStatus?: string;
}

export class CreateVendorDtoStep3 {

    @IsDefined({ message: 'Services is required' })
    @IsArray()
    @ArrayNotEmpty({ message: 'servicesOffered should not be empty' })
    @IsMongoId({ each: true })
    servicesOffered: string[];

    @IsDefined({ message: 'AgreeToTerms is required' })
    @IsBoolean()
    agreeToTerms: boolean;

    @IsDefined({ message: 'Consent is required' })
    @IsBoolean()
    consent: boolean;

    @IsOptional()
    @IsIn(['draft', 'in_progress', 'complete'])
    registrationStatus?: string;
}
