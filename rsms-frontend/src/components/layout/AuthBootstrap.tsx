'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { getRefreshToken, setRefreshToken, clearRefreshToken } from '@/lib/auth-tokens';
import type { User } from '@/types';

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const { user, setAuth, setAuthChecked } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (user) {
        setAuthChecked(true);
        return;
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setAuthChecked(true);
        return;
      }

      try {
        const tokens = await authService.refresh(refreshToken);
        setRefreshToken(tokens.refreshToken);
        const me = await authService.me();
        if (!cancelled) {
          setAuth(me as User, tokens.accessToken);
        }
      } catch {
        clearRefreshToken();
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
