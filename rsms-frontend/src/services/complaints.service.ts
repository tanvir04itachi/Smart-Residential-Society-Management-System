import { api } from '@/lib/api';
import type { Complaint, ComplaintStatus, PaginatedResult } from '@/types';
import type {
  AddNotesFormValues,
  AssignComplaintFormValues,
  CreateComplaintFormValues,
  UpdateComplaintStatusFormValues,
} from '@/schemas/complaint.schema';

export const complaintsService = {
  getAll: (params: {
    page?: number;
    limit?: number;
    status?: ComplaintStatus;
    category?: string;
  }) =>
    api
      .get<PaginatedResult<Complaint>>('/complaints', { params })
      .then((r) => r.data),

  create: (dto: CreateComplaintFormValues) =>
    api.post<Complaint>('/complaints', dto).then((r) => r.data),

  getMy: () => api.get<Complaint[]>('/complaints/my').then((r) => r.data),

  getAssigned: () =>
    api.get<Complaint[]>('/complaints/assigned').then((r) => r.data),

  getById: (id: string) =>
    api.get<Complaint>(`/complaints/${id}`).then((r) => r.data),

  assign: (id: string, dto: AssignComplaintFormValues) =>
    api.patch<Complaint>(`/complaints/${id}/assign`, dto).then((r) => r.data),

  updateStatus: (id: string, dto: UpdateComplaintStatusFormValues) =>
    api.patch<Complaint>(`/complaints/${id}/status`, dto).then((r) => r.data),

  reopen: (id: string) =>
    api.patch<Complaint>(`/complaints/${id}/reopen`).then((r) => r.data),

  addNotes: (id: string, dto: AddNotesFormValues) =>
    api.patch<Complaint>(`/complaints/${id}/notes`, dto).then((r) => r.data),

  report: (from?: string, to?: string) =>
    api
      .get('/complaints/report', { params: { from, to } })
      .then((r) => r.data),
};
