import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Announcement,
  AnnouncementTarget,
  Resident,
  User,
} from '../../database/entities';
import { AnnouncementScope, Role } from '../../common/enums';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
    @InjectRepository(AnnouncementTarget)
    private targetsRepository: Repository<AnnouncementTarget>,
    @InjectRepository(Resident)
    private residentsRepository: Repository<Resident>,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateAnnouncementDto, user: User) {
    const announcement = this.announcementsRepository.create({
      title: dto.title,
      body: dto.body,
      scope: dto.scope,
      attachmentUrl: dto.attachmentUrl ?? null,
      publishedById: user.id,
      publishedAt: new Date(),
    });
    const saved = await this.announcementsRepository.save(announcement);

    if (dto.scope !== AnnouncementScope.ALL && dto.targets?.length) {
      const targets = dto.targets.map((t) =>
        this.targetsRepository.create({
          announcementId: saved.id,
          blockId: t.blockId ?? null,
          floorNumber: t.floorNumber ?? null,
        }),
      );
      await this.targetsRepository.save(targets);
    }

    const residents = await this.getTargetedResidents(saved, dto.targets);
    await this.notificationsService.createMany(
      residents.map((r) => r.userId),
      `Announcement: ${saved.title}`,
      saved.body,
      'ANNOUNCEMENT',
      saved.id,
    );
    for (const resident of residents) {
      await this.mailService.sendAnnouncementEmail(
        resident.user.email,
        saved.title,
        saved.body,
      );
    }

    return saved;
  }

  private async getTargetedResidents(
    announcement: Announcement,
    targets?: { blockId?: string; floorNumber?: number }[],
  ): Promise<Resident[]> {
    if (announcement.scope === AnnouncementScope.ALL || !targets?.length) {
      return this.residentsRepository.find({
        where: { isActive: true },
        relations: { user: true },
      });
    }

    const qb = this.residentsRepository
      .createQueryBuilder('resident')
      .leftJoinAndSelect('resident.user', 'user')
      .leftJoin('resident.flat', 'flat')
      .where('resident.isActive = true');

    qb.andWhere(
      targets
        .map((_, i) =>
          announcement.scope === AnnouncementScope.BLOCK
            ? `flat.blockId = :blockId${i}`
            : `flat.floorNumber = :floor${i}`,
        )
        .join(' OR '),
    );

    targets.forEach((t, i) => {
      if (announcement.scope === AnnouncementScope.BLOCK) {
        qb.setParameter(`blockId${i}`, t.blockId);
      } else {
        qb.setParameter(`floor${i}`, t.floorNumber);
      }
    });

    return qb.getMany();
  }

  async findAll(user: User) {
    if (user.role !== Role.RESIDENT) {
      return this.announcementsRepository.find({
        relations: { targets: true },
        order: { createdAt: 'DESC' },
      });
    }

    const resident = await this.residentsRepository.findOne({
      where: { userId: user.id },
      relations: { flat: true },
    });

    const all = await this.announcementsRepository.find({
      relations: { targets: true },
      order: { createdAt: 'DESC' },
    });

    return all.filter((announcement) => {
      if (announcement.scope === AnnouncementScope.ALL) return true;
      if (!resident?.flat) return false;
      return announcement.targets.some((t) => {
        if (announcement.scope === AnnouncementScope.BLOCK) {
          return t.blockId === resident.flat!.blockId;
        }
        return t.floorNumber === resident.flat!.floorNumber;
      });
    });
  }

  async findOne(id: string) {
    const announcement = await this.announcementsRepository.findOne({
      where: { id },
      relations: { targets: true },
    });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    return announcement;
  }

  async update(id: string, dto: UpdateAnnouncementDto) {
    const announcement = await this.announcementsRepository.findOne({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    Object.assign(announcement, dto);
    return this.announcementsRepository.save(announcement);
  }

  async remove(id: string) {
    const result = await this.announcementsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Announcement not found');
    }
    return { success: true };
  }
}
