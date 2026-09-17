'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useNotificationsList } from '@/hooks/useNotifications';
import { notificationsService } from '@/services/notifications.service';
import { cn, formatDateTime } from '@/lib/utils';

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const commonT = useTranslations('common');
  const { page, setPage } = usePagination(1, 15);
  const { data, isLoading } = useNotificationsList(page, 15);
  const queryClient = useQueryClient();

  async function handleMarkAllRead() {
    await notificationsService.markAllAsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  async function handleMarkRead(id: string) {
    await notificationsService.markAsRead(id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t('title')}
        action={<Button onClick={handleMarkAllRead}>{t('markAllRead')}</Button>}
      />

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : data?.data.length ? (
        <div className="space-y-2">
          {data.data.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleMarkRead(n.id)}
              className={cn(
                'block w-full rounded-md border border-slate-200 p-4 text-left hover:bg-slate-50',
                !n.isRead && 'bg-blue-50/50',
              )}
            >
              <p className="text-sm font-medium text-slate-900">{n.title}</p>
              <p className="mt-1 text-sm text-slate-600">{n.body}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDateTime(n.createdAt)}</p>
            </button>
          ))}
          {data && (
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-400">{t('noNotifications')}</p>
      )}
    </div>
  );
}
