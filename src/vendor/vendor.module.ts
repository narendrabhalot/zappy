
import { Vendor, VendorSchema } from './vendor.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorService } from './vendor.service';
import {VendorController} from './vendor.controller'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
    ],
    exports: [VendorService],
    controllers: [VendorController],
   providers: [VendorService]
})
export class VendorModule { }