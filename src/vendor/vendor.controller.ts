import { Controller, Put, Param, Body, NotFoundException, UsePipes, ValidationPipe, } from '@nestjs/common';
import { VendorService } from './vendor.service';
import {
    CreateVendorDtoStep2,
    CreateVendorDtoStep3,
} from './dto/vendor.dto';

@Controller('vendors')
export class VendorController {
    constructor(private readonly vendorService: VendorService) { }

    @Put('bussiness-info/:vendorId')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async updateVendorStep2(
        @Param('vendorId') vendorId: string,
        @Body() createVendorDtoStep2: CreateVendorDtoStep2,
    ) {
        console.log("vendor id is a", vendorId)
        const vendor = await this.vendorService.getVendorById(vendorId);
        if (!vendor) throw new NotFoundException('Vendor not found');
        createVendorDtoStep2.registrationStatus = 'in_progress';
        const updatedVendor = await this.vendorService.updateVendorDto(
            vendorId,
            createVendorDtoStep2,
        );

        return {
            message: 'Vendor Step 2 data updated successfully',
            data: updatedVendor,
        };
    }

    // Step 3 – Services & Terms
    @Put('service-term/:vendorId')
    // @UsePipes(new ValidationPipe({ whitelist: true }))
    async updateVendorStep3(
        @Param('vendorId') vendorId: string,
        @Body() createVendorDtoStep3: CreateVendorDtoStep3,
    ) {
        const vendor = await this.vendorService.getVendorById(vendorId);
        if (!vendor) throw new NotFoundException('Vendor not found');
        createVendorDtoStep3.registrationStatus = 'complete';
        const updatedVendor = await this.vendorService.updateVendorDto(
            vendorId,
            createVendorDtoStep3,
        );
        return {
            message: 'Vendor Step 3 data updated successfully',
            data: updatedVendor,
        };
    }
}
