import { api } from '@/lib/api';
import type { PaginatedResult, Role, User } from '@/types';
import type { CreateUserFormValues, UpdateUserFormValues } from '@/schemas/user.schema';

export const usersService = {
  getAll: (params: { page?: number; limit?: number; role?: Role }) =>
    api
      .get<PaginatedResult<User>>('/users', { params })
      .then((r) => r.data),

  create: (dto: CreateUserFormValues) =>
    api.post<User>('/users', dto).then((r) => r.data),

  getById: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),

  update: (id: string, dto: UpdateUserFormValues) =>
    api.patch<User>(`/users/${id}`, dto).then((r) => r.data),

  deactivate: (id: string) =>
    api.patch(`/users/${id}/deactivate`).then((r) => r.data),

  activate: (id: string) =>
    api.patch(`/users/${id}/activate`).then((r) => r.data),

  changeOwnPassword: (dto: {
    currentPassword: string;
    newPassword: string;
  }) => api.patch('/users/me/password', dto).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<User>('/users/me/avatar', formData)
      .then((r) => r.data);
  },

  removeAvatar: () =>
    api.delete<User>('/users/me/avatar').then((r) => r.data),
};
