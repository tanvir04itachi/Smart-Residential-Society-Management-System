import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities';
import { normalizePagination } from '../../common/utils/pagination.util';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    title: string,
    body: string,
    type?: string,
    referenceId?: string,
  ) {
    const notification = this.notificationsRepository.create({
      userId,
      title,
      body,
      type: type ?? null,
      referenceId: referenceId ?? null,
    });
    return this.notificationsRepository.save(notification);
  }

  async createMany(
    userIds: string[],
    title: string,
    body: string,
    type?: string,
    referenceId?: string,
  ) {
    const notifications = userIds.map((userId) =>
      this.notificationsRepository.create({
        userId,
        title,
        body,
        type: type ?? null,
        referenceId: referenceId ?? null,
      }),
    );
    return this.notificationsRepository.save(notifications);
  }

  async findMine(userId: string, query: { page?: number; limit?: number }) {
    const { page, limit, skip } = normalizePagination(query);
    const [data, total] = await this.notificationsRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationsRepository.update({ id, userId }, { isRead: true });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }

  async unreadCount(userId: string) {
    const count = await this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
    return { count };
  }
}
