'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import {
  clearRefreshToken,
  getRefreshToken,
  setRefreshToken,
} from '@/lib/auth-tokens';
import type { User } from '@/types';

export function useAuth() {
  const { user, accessToken, isAuthChecked, setAuth, setUser, clearAuth } =
    useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login({ email, password });
      setRefreshToken(result.refreshToken);
      const me = await authService.me();
      setAuth(me as User, result.accessToken);
      return me;
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } finally {
      clearRefreshToken();
      clearAuth();
    }
  }, [clearAuth]);

  return {
    user,
    accessToken,
    isAuthenticated: !!user,
    isAuthChecked,
    login,
    logout,
    setUser,
  };
}
