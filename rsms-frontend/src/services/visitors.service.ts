import { api } from '@/lib/api';
import type { Visitor } from '@/types';
import type {
  FlagVisitorFormValues,
  PreRegisterVisitorFormValues,
  WalkInVisitorFormValues,
} from '@/schemas/visitor.schema';

export const visitorsService = {
  preRegister: (dto: PreRegisterVisitorFormValues) =>
    api.post<Visitor>('/visitors/pre-register', dto).then((r) => r.data),

  getMy: () => api.get<Visitor[]>('/visitors/my').then((r) => r.data),

  search: (q: string) =>
    api
      .get<Visitor[]>('/visitors/search', { params: { q } })
      .then((r) => r.data),

  walkIn: (dto: WalkInVisitorFormValues) =>
    api.post<Visitor>('/visitors/walk-in', dto).then((r) => r.data),

  log: () => api.get<Visitor[]>('/visitors/log').then((r) => r.data),

  deliveries: () =>
    api.get<Visitor[]>('/visitors/deliveries').then((r) => r.data),

  entry: (id: string) =>
    api.post<Visitor>(`/visitors/${id}/entry`).then((r) => r.data),

  exit: (id: string) =>
    api.post<Visitor>(`/visitors/${id}/exit`).then((r) => r.data),

  approve: (id: string) =>
    api.post<Visitor>(`/visitors/${id}/approve`).then((r) => r.data),

  deny: (id: string) =>
    api.post<Visitor>(`/visitors/${id}/deny`).then((r) => r.data),

  flag: (id: string, dto: FlagVisitorFormValues) =>
    api.patch<Visitor>(`/visitors/${id}/flag`, dto).then((r) => r.data),
};
