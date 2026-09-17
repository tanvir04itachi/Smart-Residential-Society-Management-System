import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { Resident, User } from '../../database/entities';
import { Role } from '../../common/enums';
import { APP_CONSTANTS } from '../../common/constants/app.constants';
import { MailService } from '../mail/mail.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';

@Injectable()
export class ResidentsService {
  constructor(
    @InjectRepository(Resident)
    private residentsRepository: Repository<Resident>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private mailService: MailService,
  ) {}

  findAll() {
    return this.residentsRepository.find({
      relations: { user: true, flat: { block: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateResidentDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const plainPassword = dto.password ?? randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(
      plainPassword,
      APP_CONSTANTS.BCRYPT_COST_FACTOR,
    );

    const resident = await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone ?? null,
        role: Role.RESIDENT,
        passwordHash,
      });
      const savedUser = await manager.save(user);

      const residentEntity = manager.create(Resident, {
        userId: savedUser.id,
        flatId: dto.flatId ?? null,
        type: dto.type,
        emergencyContact: dto.emergencyContact ?? null,
        familyMembers: dto.familyMembers ?? null,
        moveInDate: dto.moveInDate ?? null,
      });
      return manager.save(residentEntity);
    });

    await this.mailService.sendWelcomeEmail(
      dto.email,
      dto.fullName,
      plainPassword,
    );

    return this.findOne(resident.id);
  }

  async findOne(id: string, requester?: User) {
    const resident = await this.residentsRepository.findOne({
      where: { id },
      relations: { user: true, flat: { block: true } },
    });
    if (!resident) {
      throw new NotFoundException('Resident not found');
    }
    this.assertAccess(resident, requester);
    return resident;
  }

  async update(id: string, dto: UpdateResidentDto, requester?: User) {
    const resident = await this.residentsRepository.findOne({
      where: { id },
    });
    if (!resident) {
      throw new NotFoundException('Resident not found');
    }
    this.assertAccess(resident, requester);
    Object.assign(resident, dto);
    return this.residentsRepository.save(resident);
  }

  async flatHistory(flatId: string) {
    return this.residentsRepository.find({
      where: { flatId },
      relations: { user: true },
      order: { moveInDate: 'DESC' },
      withDeleted: false,
    });
  }

  private assertAccess(resident: Resident, requester?: User) {
    if (!requester) return;
    if (requester.role === Role.MANAGER) return;
    if (requester.role === Role.RESIDENT && resident.userId === requester.id) {
      return;
    }
    throw new ForbiddenException('Access denied');
  }
}
