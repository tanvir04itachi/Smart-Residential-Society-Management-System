import { api } from '@/lib/api';
import type { Resident } from '@/types';
import type {
  CreateResidentFormValues,
  UpdateResidentFormValues,
} from '@/schemas/resident.schema';

export const residentsService = {
  getAll: () => api.get<Resident[]>('/residents').then((r) => r.data),

  create: (dto: CreateResidentFormValues) =>
    api.post<Resident>('/residents', dto).then((r) => r.data),

  getById: (id: string) =>
    api.get<Resident>(`/residents/${id}`).then((r) => r.data),

  update: (id: string, dto: UpdateResidentFormValues) =>
    api.patch<Resident>(`/residents/${id}`, dto).then((r) => r.data),

  flatHistory: (flatId: string) =>
    api
      .get<Resident[]>(`/residents/flat/${flatId}/history`)
      .then((r) => r.data),
};
