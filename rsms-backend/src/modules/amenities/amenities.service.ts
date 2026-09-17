import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Amenity,
  AmenitySlot,
  Bill,
  Booking,
  Resident,
  User,
} from '../../database/entities';
import { BillStatus, BookingStatus } from '../../common/enums';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { BookAmenityDto } from './dto/book-amenity.dto';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity) private amenitiesRepository: Repository<Amenity>,
    @InjectRepository(AmenitySlot)
    private slotsRepository: Repository<AmenitySlot>,
    @InjectRepository(Booking) private bookingsRepository: Repository<Booking>,
    @InjectRepository(Resident)
    private residentsRepository: Repository<Resident>,
    @InjectRepository(Bill) private billsRepository: Repository<Bill>,
  ) {}

  private async getResidentByUserId(userId: string): Promise<Resident> {
    const resident = await this.residentsRepository.findOne({
      where: { userId },
    });
    if (!resident) {
      throw new NotFoundException('Resident profile not found');
    }
    return resident;
  }

  findAll() {
    return this.amenitiesRepository.find({
      where: { isActive: true },
      relations: { slots: true },
    });
  }

  async create(dto: CreateAmenityDto) {
    const amenity = this.amenitiesRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      capacity: dto.capacity ?? null,
      location: dto.location ?? null,
    });
    const saved = await this.amenitiesRepository.save(amenity);

    if (dto.slots?.length) {
      const slots = dto.slots.map((s) =>
        this.slotsRepository.create({ ...s, amenityId: saved.id }),
      );
      await this.slotsRepository.save(slots);
    }

    return this.amenitiesRepository.findOne({
      where: { id: saved.id },
      relations: { slots: true },
    });
  }

  async update(id: string, dto: UpdateAmenityDto) {
    const amenity = await this.amenitiesRepository.findOne({ where: { id } });
    if (!amenity) {
      throw new NotFoundException('Amenity not found');
    }
    Object.assign(amenity, dto);
    return this.amenitiesRepository.save(amenity);
  }

  async getSlots(amenityId: string) {
    const amenity = await this.amenitiesRepository.findOne({
      where: { id: amenityId },
    });
    if (!amenity) {
      throw new NotFoundException('Amenity not found');
    }
    return this.slotsRepository.find({
      where: { amenityId, isAvailable: true },
    });
  }

  async book(amenityId: string, dto: BookAmenityDto, user: User) {
    const resident = await this.getResidentByUserId(user.id);

    const overdueBill = await this.billsRepository.findOne({
      where: { residentId: resident.id, status: BillStatus.OVERDUE },
    });
    if (overdueBill) {
      throw new ForbiddenException(
        'Booking blocked: you have overdue bills. Please clear dues first.',
      );
    }

    const slot = await this.slotsRepository.findOne({
      where: { id: dto.slotId, amenityId },
    });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    const existing = await this.bookingsRepository.findOne({
      where: {
        slotId: dto.slotId,
        bookingDate: dto.bookingDate,
        status: BookingStatus.CONFIRMED,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'This slot is already booked for the selected date',
      );
    }

    const booking = this.bookingsRepository.create({
      residentId: resident.id,
      amenityId,
      slotId: dto.slotId,
      bookingDate: dto.bookingDate,
      status: BookingStatus.CONFIRMED,
    });
    return this.bookingsRepository.save(booking);
  }

  async findMyBookings(user: User) {
    const resident = await this.getResidentByUserId(user.id);
    return this.bookingsRepository.find({
      where: { residentId: resident.id },
      relations: { amenity: true, slot: true },
      order: { bookingDate: 'DESC' },
    });
  }

  async cancelBooking(id: string, user: User) {
    const resident = await this.getResidentByUserId(user.id);
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.residentId !== resident.id) {
      throw new ForbiddenException('Access denied');
    }
    booking.status = BookingStatus.CANCELLED;
    return this.bookingsRepository.save(booking);
  }

  findAllBookings() {
    return this.bookingsRepository.find({
      relations: { amenity: true, slot: true, resident: { user: true } },
      order: { bookingDate: 'DESC' },
    });
  }
}
