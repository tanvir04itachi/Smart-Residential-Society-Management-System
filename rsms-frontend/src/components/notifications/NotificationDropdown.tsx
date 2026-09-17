'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useUnreadCount, useNotificationsList } from '@/hooks/useNotifications';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationStore } from '@/store/notification.store';
import { formatDateTime, cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

export function NotificationDropdown() {
  const t = useTranslations('notifications');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  useUnreadCount();
  const { data, isLoading } = useNotificationsList(1, 10);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function handleMarkAllRead() {
    await notificationsService.markAllAsRead();
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  async function handleMarkRead(id: string) {
    await notificationsService.markAsRead(id);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  return (
    <div className="relative flex h-full items-center" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rsms-control relative rounded-full p-2 text-slate-500 hover:brightness-105 hover:text-slate-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="rsms-surface absolute right-0 top-full z-50 mt-2 max-h-[calc(100vh-7rem)] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 shadow-[0_18px_45px_rgba(42,35,86,0.18)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">{t('title')}</span>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              {t('markAllRead')}
            </button>
          </div>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : data && data.data.length > 0 ? (
              data.data.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  className={cn(
                    'rsms-control block w-full border-b border-slate-50 px-4 py-3 text-left hover:brightness-105',
                    !n.isRead && 'bg-blue-50/50',
                  )}
                >
                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatDateTime(n.createdAt)}
                  </p>
                </button>
              ))
            ) : (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                {t('noNotifications')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
