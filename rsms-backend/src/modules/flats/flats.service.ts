import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flat, Resident } from '../../database/entities';
import { CreateFlatDto } from './dto/create-flat.dto';
import { AssignResidentDto } from './dto/assign-resident.dto';

@Injectable()
export class FlatsService {
  constructor(
    @InjectRepository(Flat) private flatsRepository: Repository<Flat>,
    @InjectRepository(Resident)
    private residentsRepository: Repository<Resident>,
  ) {}

  findAll() {
    return this.flatsRepository.find({
      relations: { block: true },
      order: { floorNumber: 'ASC', flatNumber: 'ASC' },
    });
  }

  async create(dto: CreateFlatDto) {
    const existing = await this.flatsRepository.findOne({
      where: { blockId: dto.blockId, flatNumber: dto.flatNumber },
    });
    if (existing) {
      throw new ConflictException('Flat number already exists in this block');
    }
    const flat = this.flatsRepository.create(dto);
    return this.flatsRepository.save(flat);
  }

  async findOne(id: string) {
    const flat = await this.flatsRepository.findOne({
      where: { id },
      relations: { block: true, residents: { user: true } },
    });
    if (!flat) {
      throw new NotFoundException('Flat not found');
    }
    return flat;
  }

  async assignResident(flatId: string, dto: AssignResidentDto) {
    const flat = await this.flatsRepository.findOne({ where: { id: flatId } });
    if (!flat) {
      throw new NotFoundException('Flat not found');
    }
    const resident = await this.residentsRepository.findOne({
      where: { id: dto.residentId },
    });
    if (!resident) {
      throw new NotFoundException('Resident not found');
    }

    resident.flatId = flatId;
    resident.moveInDate = new Date().toISOString().slice(0, 10);
    resident.moveOutDate = null;
    await this.residentsRepository.save(resident);

    flat.isOccupied = true;
    return this.flatsRepository.save(flat);
  }

  async vacate(flatId: string) {
    const flat = await this.flatsRepository.findOne({
      where: { id: flatId },
      relations: { residents: true },
    });
    if (!flat) {
      throw new NotFoundException('Flat not found');
    }

    const activeResidents = await this.residentsRepository.find({
      where: { flatId },
    });
    for (const resident of activeResidents) {
      resident.flatId = null;
      resident.moveOutDate = new Date().toISOString().slice(0, 10);
      await this.residentsRepository.save(resident);
    }

    flat.isOccupied = false;
    return this.flatsRepository.save(flat);
  }
}
