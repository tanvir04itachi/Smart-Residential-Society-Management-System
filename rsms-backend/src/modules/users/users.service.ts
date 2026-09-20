import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../database/entities';
import { AVATAR_UPLOAD_DIR } from './avatar-upload.config';
import { Role } from '../../common/enums';
import { APP_CONSTANTS } from '../../common/constants/app.constants';
import {
  normalizePagination,
  buildPaginatedResult,
} from '../../common/utils/pagination.util';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { generateUserId } from '../../common/utils/user-id.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private mailService: MailService,
  ) {}

  async findAll(query: { page?: number; limit?: number; role?: Role }) {
    const { page, limit, skip } = normalizePagination(query);
    const qb = this.usersRepository.createQueryBuilder('user');
    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }
    qb.orderBy('user.createdAt', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResult(data, total, page, limit);
  }

  async create(dto: CreateUserDto) {
    const plainPassword = dto.password ?? randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(
      plainPassword,
      APP_CONSTANTS.BCRYPT_COST_FACTOR,
    );

    const saved = await this.dataSource.transaction(async (manager) => {
      const usersRepository = manager.getRepository(User);
      const existing = await usersRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }

      const user = usersRepository.create({
        id: await generateUserId(manager, dto.role),
        fullName: dto.fullName,
        email: dto.email,
        role: dto.role,
        phone: dto.phone ?? null,
        passwordHash,
      });
      return usersRepository.save(user);
    });

    await this.mailService.sendWelcomeEmail(
      saved.email,
      saved.fullName,
      plainPassword,
    );

    return this.sanitize(saved);
  }

  async findById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, dto);
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async deactivate(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = false;
    await this.usersRepository.save(user);
    return { success: true };
  }

  async activate(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = true;
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await this.usersRepository.save(user);
    return { success: true };
  }

  async changeOwnPassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const matches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must differ from current password',
      );
    }

    user.passwordHash = await bcrypt.hash(
      dto.newPassword,
      APP_CONSTANTS.BCRYPT_COST_FACTOR,
    );
    await this.usersRepository.save(user);
    return { success: true };
  }

  async updateAvatar(userId: string, filename: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.deleteAvatarFile(user.profilePicture);
    user.profilePicture = `/uploads/avatars/${filename}`;
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async removeAvatar(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.deleteAvatarFile(user.profilePicture);
    user.profilePicture = null;
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  private async deleteAvatarFile(profilePicture: string | null) {
    if (!profilePicture) return;
    const filename = profilePicture.split('/').pop();
    if (!filename) return;
    try {
      await unlink(join(AVATAR_UPLOAD_DIR, filename));
    } catch {
      // File may already be missing; nothing to clean up.
    }
  }

  private sanitize(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
  }
}
