import { api } from '@/lib/api';
import type { User } from '@/types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; fullName: string; email: string; role: string };
}

export const authService = {
  login: (dto: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', dto).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api
      .post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        refreshToken,
      })
      .then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  verifyOtp: (email: string, otp: string) =>
    api.post('/auth/verify-otp', { email, otp }).then((r) => r.data),

  resetPassword: (dto: { email: string; otp: string; newPassword: string }) =>
    api.post('/auth/reset-password', dto).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),
};
