import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators';
import { Role } from '../../common/enums';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { User } from '../../database/entities';
import { AmenitiesService } from './amenities.service';
import {
  CreateAmenityDto,
  CreateAmenitySchema,
} from './dto/create-amenity.dto';
import {
  UpdateAmenityDto,
  UpdateAmenitySchema,
} from './dto/update-amenity.dto';
import { BookAmenityDto, BookAmenitySchema } from './dto/book-amenity.dto';

@ApiTags('amenities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('amenities')
export class AmenitiesController {
  constructor(private amenitiesService: AmenitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List amenities with available slots' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.amenitiesService.findAll();
  }

  @Post()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Create amenity' })
  @ApiBody({
    schema: {
      example: {
        name: 'Swimming Pool',
        description: 'Rooftop swimming pool, 6am-9pm',
        capacity: 20,
        location: 'Rooftop',
        slots: [
          { dayOfWeek: 6, startTime: '08:00', endTime: '09:00' },
          { dayOfWeek: 6, startTime: '09:00', endTime: '10:00' },
        ],
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Amenity created' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  create(
    @Body(new ZodValidationPipe(CreateAmenitySchema)) dto: CreateAmenityDto,
  ) {
    return this.amenitiesService.create(dto);
  }

  @Get('bookings/my')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'My bookings' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findMyBookings(@CurrentUser() user: User) {
    return this.amenitiesService.findMyBookings(user);
  }

  @Get('bookings')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'All bookings' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findAllBookings() {
    return this.amenitiesService.findAllBookings();
  }

  @Patch('bookings/:id/cancel')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiParam({ name: 'id', example: '3d9e6a2b-1234-4a6b-9abc-1234567890ab' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  cancelBooking(@Param('id') id: string, @CurrentUser() user: User) {
    return this.amenitiesService.cancelBooking(id, user);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Update amenity config' })
  @ApiParam({ name: 'id', example: '7f0e0aed-82df-4299-ba5b-b37e93600395' })
  @ApiBody({
    schema: { example: { capacity: 25, isActive: true } },
  })
  @ApiResponse({ status: 200, description: 'Amenity updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateAmenitySchema)) dto: UpdateAmenityDto,
  ) {
    return this.amenitiesService.update(id, dto);
  }

  @Get(':id/slots')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'Get available booking slots' })
  @ApiParam({ name: 'id', example: '7f0e0aed-82df-4299-ba5b-b37e93600395' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  getSlots(@Param('id') id: string) {
    return this.amenitiesService.getSlots(id);
  }

  @Post(':id/book')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'Book a slot' })
  @ApiParam({ name: 'id', example: '7f0e0aed-82df-4299-ba5b-b37e93600395' })
  @ApiBody({
    schema: {
      example: {
        slotId: '5a1b2c3d-4e5f-6789-0abc-def123456789',
        bookingDate: '2026-09-26',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Slot booked' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - wrong role or overdue bills',
  })
  book(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(BookAmenitySchema)) dto: BookAmenityDto,
    @CurrentUser() user: User,
  ) {
    return this.amenitiesService.book(id, dto, user);
  }
}
