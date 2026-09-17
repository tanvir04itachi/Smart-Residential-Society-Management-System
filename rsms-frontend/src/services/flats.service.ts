import { api } from '@/lib/api';
import type { Block, Flat } from '@/types';
import type {
  AssignResidentFormValues,
  CreateBlockFormValues,
  CreateFlatFormValues,
} from '@/schemas/flat.schema';

export const blocksService = {
  getAll: () => api.get<Block[]>('/blocks').then((r) => r.data),
  create: (dto: CreateBlockFormValues) =>
    api.post<Block>('/blocks', dto).then((r) => r.data),
};

export const flatsService = {
  getAll: () => api.get<Flat[]>('/flats').then((r) => r.data),

  create: (dto: CreateFlatFormValues) =>
    api.post<Flat>('/flats', dto).then((r) => r.data),

  getById: (id: string) => api.get<Flat>(`/flats/${id}`).then((r) => r.data),

  assign: (id: string, dto: AssignResidentFormValues) =>
    api.patch<Flat>(`/flats/${id}/assign`, dto).then((r) => r.data),

  vacate: (id: string) =>
    api.patch<Flat>(`/flats/${id}/vacate`).then((r) => r.data),
};
