import { api } from '@/lib/api';
import type { Announcement, AnnouncementScope } from '@/types';
import type { UpdateAnnouncementFormValues } from '@/schemas/announcement.schema';

export interface CreateAnnouncementDto {
  title: string;
  body: string;
  scope: AnnouncementScope;
  attachmentUrl?: string;
  targets?: { blockId?: string; floorNumber?: number }[];
}

export const announcementsService = {
  getAll: () => api.get<Announcement[]>('/announcements').then((r) => r.data),

  create: (dto: CreateAnnouncementDto) =>
    api.post<Announcement>('/announcements', dto).then((r) => r.data),

  getById: (id: string) =>
    api.get<Announcement>(`/announcements/${id}`).then((r) => r.data),

  update: (id: string, dto: UpdateAnnouncementFormValues) =>
    api.patch<Announcement>(`/announcements/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/announcements/${id}`).then((r) => r.data),
};
