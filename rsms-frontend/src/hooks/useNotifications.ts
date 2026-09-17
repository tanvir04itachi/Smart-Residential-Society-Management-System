'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationStore } from '@/store/notification.store';
import { useAuth } from './useAuth';

const POLL_INTERVAL_MS = 30_000;

export function useUnreadCount() {
  const { isAuthenticated } = useAuth();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const query = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsService.unreadCount(),
    enabled: isAuthenticated,
    refetchInterval: POLL_INTERVAL_MS,
  });

  useEffect(() => {
    if (query.data) {
      setUnreadCount(query.data.count);
    }
  }, [query.data, setUnreadCount]);

  return query;
}

export function useNotificationsList(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['notifications', 'list', page, limit],
    queryFn: () => notificationsService.getMine({ page, limit }),
  });
}

export function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
}
