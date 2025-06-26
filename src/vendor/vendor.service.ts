import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor, VendorDocument } from './vendor.schema';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor.name)
    private vendorModel: Model<VendorDocument>,
  ) { }

  async getVendorByEmail(email: string): Promise<VendorDocument | null> {
    return this.vendorModel.findOne({ email }).exec();
  }

  async getVendorById(vendorId: string): Promise<VendorDocument> {
    const vendor = await this.vendorModel.findById(vendorId).exec();
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }

  async createVendor(vendorData: Partial<Vendor>): Promise<VendorDocument> {
    const newVendor = new this.vendorModel({
      ...vendorData,
      registrationStatus: 'draft',
    });
    return await newVendor.save();
  }

  async updateVendorDto(
    vendorId: string,
    updateData: Partial<Vendor>,
  ): Promise<VendorDocument> {
    const vendor = await this.vendorModel.findById(vendorId);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Merge fields from Step 2 or Step 3
    Object.assign(vendor, updateData);



    return await vendor.save();
  }

  async findVendorByMobile(mobile: number): Promise<VendorDocument | null> {
    return this.vendorModel.findOne({ mobile }).exec();
  }
}
