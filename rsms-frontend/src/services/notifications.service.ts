import { api } from '@/lib/api';
import type { Notification, PaginatedResult } from '@/types';

export const notificationsService = {
  getMine: (params: { page?: number; limit?: number }) =>
    api
      .get<PaginatedResult<Notification>>('/notifications', { params })
      .then((r) => r.data),

  unreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
};
