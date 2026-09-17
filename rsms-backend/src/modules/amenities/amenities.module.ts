import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Amenity,
  AmenitySlot,
  Bill,
  Booking,
  Resident,
} from '../../database/entities';
import { AmenitiesController } from './amenities.controller';
import { AmenitiesService } from './amenities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Amenity, AmenitySlot, Booking, Resident, Bill]),
  ],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports: [AmenitiesService],
})
export class AmenitiesModule {}
