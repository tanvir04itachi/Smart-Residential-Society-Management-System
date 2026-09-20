import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint, Resident, User } from '../../database/entities';
import { ComplaintStatus, Role } from '../../common/enums';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../common/utils/pagination.util';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { AssignComplaintDto } from './dto/assign-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { AddNotesDto } from './dto/add-notes.dto';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private complaintsRepository: Repository<Complaint>,
    @InjectRepository(Resident)
    private residentsRepository: Repository<Resident>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  private async getResidentByUserId(userId: string): Promise<Resident> {
    const resident = await this.residentsRepository.findOne({
      where: { id: userId },
      relations: { user: true },
    });
    if (!resident) {
      throw new NotFoundException('Resident profile not found');
    }
    return resident;
  }

  async create(dto: CreateComplaintDto, user: User) {
    const resident = await this.getResidentByUserId(user.id);
    const complaint = this.complaintsRepository.create({
      ...dto,
      residentId: resident.id,
    });
    return this.complaintsRepository.save(complaint);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: ComplaintStatus;
    category?: string;
  }) {
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.complaintsRepository
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.resident', 'resident')
      .leftJoinAndSelect('resident.user', 'user')
      .leftJoinAndSelect('complaint.assignedTo', 'assignedTo');

    if (query.status) {
      qb.andWhere('complaint.status = :status', { status: query.status });
    }
    if (query.category) {
      qb.andWhere('complaint.category = :category', {
        category: query.category,
      });
    }
    qb.orderBy('complaint.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResult(data, total, page, limit);
  }

  async findMine(user: User) {
    const resident = await this.getResidentByUserId(user.id);
    return this.complaintsRepository.find({
      where: { residentId: resident.id },
      relations: { assignedTo: true },
      order: { createdAt: 'DESC' },
    });
  }

  findAssigned(user: User) {
    return this.complaintsRepository.find({
      where: { assignedToId: user.id },
      relations: { resident: { user: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const complaint = await this.complaintsRepository.findOne({
      where: { id },
      relations: { resident: { user: true }, assignedTo: true },
    });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (user.role === Role.RESIDENT) {
      const resident = await this.getResidentByUserId(user.id);
      if (complaint.residentId !== resident.id) {
        throw new ForbiddenException('Access denied');
      }
    } else if (user.role === Role.MAINTENANCE) {
      if (complaint.assignedToId !== user.id) {
        throw new ForbiddenException('Access denied');
      }
    }

    return complaint;
  }

  async assign(id: string, dto: AssignComplaintDto) {
    const complaint = await this.complaintsRepository.findOne({
      where: { id },
      relations: { resident: { user: true } },
    });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    const staff = await this.usersRepository.findOne({
      where: { id: dto.assignedToId },
    });
    if (!staff || staff.role !== Role.MAINTENANCE) {
      throw new BadRequestException(
        'Assignee must be a maintenance staff user',
      );
    }

    complaint.assignedToId = dto.assignedToId;
    complaint.status = ComplaintStatus.ASSIGNED;
    const saved = await this.complaintsRepository.save(complaint);

    await this.notificationsService.create(
      complaint.resident.id,
      'Complaint Assigned',
      `Your complaint "${complaint.title}" has been assigned to maintenance staff.`,
      'COMPLAINT',
      complaint.id,
    );
    await this.notificationsService.create(
      staff.id,
      'New Complaint Assigned',
      `You have been assigned a new complaint: "${complaint.title}".`,
      'COMPLAINT',
      complaint.id,
    );
    await this.mailService.sendComplaintStatusEmail(
      complaint.resident.user.email,
      complaint.title,
      saved.status,
    );

    return saved;
  }

  async updateStatus(id: string, dto: UpdateComplaintStatusDto) {
    const complaint = await this.complaintsRepository.findOne({
      where: { id },
      relations: { resident: { user: true } },
    });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    complaint.status = dto.status;
    if (dto.status === ComplaintStatus.RESOLVED) {
      complaint.resolvedAt = new Date();
    }
    const saved = await this.complaintsRepository.save(complaint);

    await this.notificationsService.create(
      complaint.resident.id,
      'Complaint Status Updated',
      `Your complaint "${complaint.title}" is now ${dto.status}.`,
      'COMPLAINT',
      complaint.id,
    );
    await this.mailService.sendComplaintStatusEmail(
      complaint.resident.user.email,
      complaint.title,
      dto.status,
    );

    return saved;
  }

  async reopen(id: string, user: User) {
    const resident = await this.getResidentByUserId(user.id);
    const complaint = await this.complaintsRepository.findOne({
      where: { id },
    });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }
    if (complaint.residentId !== resident.id) {
      throw new ForbiddenException('Access denied');
    }
    if (
      complaint.status !== ComplaintStatus.RESOLVED &&
      complaint.status !== ComplaintStatus.CLOSED
    ) {
      throw new BadRequestException(
        'Only resolved or closed complaints can be reopened',
      );
    }

    complaint.status = ComplaintStatus.REOPENED;
    complaint.resolvedAt = null;
    const saved = await this.complaintsRepository.save(complaint);

    if (complaint.assignedToId) {
      await this.notificationsService.create(
        complaint.assignedToId,
        'Complaint Reopened',
        `Complaint "${complaint.title}" has been reopened by the resident.`,
        'COMPLAINT',
        complaint.id,
      );
    }

    return saved;
  }

  async addNotes(id: string, dto: AddNotesDto, user: User) {
    const complaint = await this.complaintsRepository.findOne({
      where: { id },
    });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }
    if (complaint.assignedToId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    complaint.staffNotes = dto.staffNotes;
    return this.complaintsRepository.save(complaint);
  }

  async report(from?: string, to?: string) {
    const qb = this.complaintsRepository.createQueryBuilder('complaint');
    if (from && to) {
      qb.where('complaint.createdAt BETWEEN :from AND :to', {
        from: new Date(from),
        to: new Date(to),
      });
    }

    const byStatus = await qb
      .clone()
      .select('complaint.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('complaint.status')
      .getRawMany();

    const byCategory = await qb
      .clone()
      .select('complaint.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('complaint.category')
      .getRawMany();

    const byStaff = await qb
      .clone()
      .select('complaint.assignedToId', 'assignedToId')
      .addSelect('COUNT(*)', 'count')
      .andWhere('complaint.assignedToId IS NOT NULL')
      .groupBy('complaint.assignedToId')
      .getRawMany();

    return { byStatus, byCategory, byStaff };
  }
}
