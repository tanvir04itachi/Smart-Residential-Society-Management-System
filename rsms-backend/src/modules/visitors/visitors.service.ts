import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Resident, User, Visitor } from '../../database/entities';
import { VisitorStatus, VisitorType } from '../../common/enums';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PreRegisterVisitorDto } from './dto/pre-register-visitor.dto';
import { WalkInVisitorDto } from './dto/walk-in-visitor.dto';
import { FlagVisitorDto } from './dto/flag-visitor.dto';

@Injectable()
export class VisitorsService {
  constructor(
    @InjectRepository(Visitor) private visitorsRepository: Repository<Visitor>,
    @InjectRepository(Resident)
    private residentsRepository: Repository<Resident>,
    private mailService: MailService,
    private notificationsService: NotificationsService,
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

  async preRegister(dto: PreRegisterVisitorDto, user: User) {
    const resident = await this.getResidentByUserId(user.id);
    const visitor = this.visitorsRepository.create({
      ...dto,
      expectedArrival: dto.expectedArrival
        ? new Date(dto.expectedArrival)
        : null,
      preRegisteredById: resident.id,
      flatId: resident.flatId,
      verificationStatus: VisitorStatus.APPROVED,
    });
    return this.visitorsRepository.save(visitor);
  }

  async findMine(user: User) {
    const resident = await this.getResidentByUserId(user.id);
    return this.visitorsRepository.find({
      where: { preRegisteredById: resident.id },
      order: { createdAt: 'DESC' },
    });
  }

  search(query: string) {
    return this.visitorsRepository.find({
      where: [
        { visitorName: ILike(`%${query}%`) },
        { phone: ILike(`%${query}%`) },
      ],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async logEntry(id: string, guard: User) {
    const visitor = await this.visitorsRepository.findOne({ where: { id } });
    if (!visitor) {
      throw new NotFoundException('Visitor not found');
    }
    if (visitor.verificationStatus === VisitorStatus.DENIED) {
      throw new BadRequestException('Visitor entry was denied');
    }

    visitor.entryTime = new Date();
    visitor.verifiedByGuardId = guard.id;
    visitor.verificationStatus = VisitorStatus.APPROVED;
    const saved = await this.visitorsRepository.save(visitor);

    if (visitor.preRegisteredById) {
      const resident = await this.residentsRepository.findOne({
        where: { id: visitor.preRegisteredById },
        relations: { user: true },
      });
      if (resident) {
        await this.notificationsService.create(
          resident.userId,
          'Visitor Arrived',
          `Your visitor ${visitor.visitorName} has arrived at the gate.`,
          'VISITOR',
          visitor.id,
        );
        await this.mailService.sendVisitorArrivalEmail(
          resident.user.email,
          visitor.visitorName,
        );
      }
    }

    return saved;
  }

  async logExit(id: string) {
    const visitor = await this.visitorsRepository.findOne({ where: { id } });
    if (!visitor) {
      throw new NotFoundException('Visitor not found');
    }
    visitor.exitTime = new Date();
    visitor.verificationStatus = VisitorStatus.EXITED;
    return this.visitorsRepository.save(visitor);
  }

  async walkIn(dto: WalkInVisitorDto, guard: User) {
    const visitor = this.visitorsRepository.create({
      ...dto,
      verifiedByGuardId: guard.id,
      verificationStatus: VisitorStatus.PENDING,
    });
    const saved = await this.visitorsRepository.save(visitor);

    const residents = await this.residentsRepository.find({
      where: { flatId: dto.flatId },
      relations: { user: true },
    });
    await this.notificationsService.createMany(
      residents.map((r) => r.userId),
      'Visitor Waiting at Gate',
      `A visitor "${dto.visitorName}" is waiting at the gate. Please approve or deny.`,
      'VISITOR',
      saved.id,
    );

    return saved;
  }

  async approve(id: string, user: User) {
    const visitor = await this.assertResidentOwnsFlat(id, user);
    visitor.verificationStatus = VisitorStatus.APPROVED;
    return this.visitorsRepository.save(visitor);
  }

  async deny(id: string, user: User) {
    const visitor = await this.assertResidentOwnsFlat(id, user);
    visitor.verificationStatus = VisitorStatus.DENIED;
    return this.visitorsRepository.save(visitor);
  }

  private async assertResidentOwnsFlat(id: string, user: User) {
    const resident = await this.getResidentByUserId(user.id);
    const visitor = await this.visitorsRepository.findOne({ where: { id } });
    if (!visitor) {
      throw new NotFoundException('Visitor not found');
    }
    if (!visitor.flatId || visitor.flatId !== resident.flatId) {
      throw new ForbiddenException('Access denied');
    }
    return visitor;
  }

  async flag(id: string, _dto: FlagVisitorDto) {
    const visitor = await this.visitorsRepository.findOne({ where: { id } });
    if (!visitor) {
      throw new NotFoundException('Visitor not found');
    }
    visitor.isFlagged = true;
    visitor.visitorType = VisitorType.SUSPICIOUS;
    return this.visitorsRepository.save(visitor);
  }

  log() {
    return this.visitorsRepository.find({
      order: { createdAt: 'DESC' },
      relations: { flat: true, verifiedByGuard: true },
    });
  }

  deliveries() {
    return this.visitorsRepository.find({
      where: { visitorType: VisitorType.DELIVERY },
      order: { createdAt: 'DESC' },
    });
  }
}
