'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { announcementsService } from '@/services/announcements.service';
import { Role } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

export default function AnnouncementsPage() {
  const t = useTranslations('announcements');
  const commonT = useTranslations('common');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsService.getAll(),
  });

  async function handleDelete(id: string) {
    try {
      await announcementsService.remove(id);
      toast.success(commonT('success'));
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div>
      <PageHeader
        title={t('title')}
        action={
          user?.role === Role.MANAGER ? (
            <Link href="/dashboard/announcements/new">
              <Button>
                <Plus className="h-4 w-4" />
                {t('newAnnouncement')}
              </Button>
            </Link>
          ) : undefined
        }
      />

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : announcements?.length ? (
        <div className="space-y-4">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              canManage={user?.role === Role.MANAGER}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">{commonT('noData')}</p>
      )}
    </div>
  );
}
