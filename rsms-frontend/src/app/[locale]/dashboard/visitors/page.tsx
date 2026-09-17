'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { visitorsService } from '@/services/visitors.service';
import { notificationsService } from '@/services/notifications.service';
import { Role, type Visitor } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

function PendingApprovals() {
  const t = useTranslations('visitors');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', 'list', 1, 20],
    queryFn: () => notificationsService.getMine({ page: 1, limit: 20 }),
  });

  const pending = (data?.data ?? []).filter(
    (n) => n.type === 'VISITOR' && !n.isRead,
  );

  async function handle(id: string, action: 'approve' | 'deny', notifId: string) {
    try {
      if (action === 'approve') {
        await visitorsService.approve(id);
      } else {
        await visitorsService.deny(id);
      }
      await notificationsService.markAsRead(notifId);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  if (pending.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Pending gate approvals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.map((n) => (
          <div
            key={n.id}
            className="flex items-center justify-between rounded-md border border-slate-100 p-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{n.title}</p>
              <p className="text-xs text-slate-500">{n.body}</p>
            </div>
            {n.referenceId && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handle(n.referenceId!, 'approve', n.id)}>
                  {t('approve')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handle(n.referenceId!, 'deny', n.id)}
                >
                  {t('deny')}
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function VisitorsPage() {
  const t = useTranslations('visitors');
  const commonT = useTranslations('common');
  const { user } = useAuth();

  const isStaffView = user?.role === Role.MANAGER || user?.role === Role.GUARD;

  const logQuery = useQuery({
    queryKey: ['visitors', 'log'],
    queryFn: () => visitorsService.log(),
    enabled: isStaffView,
  });

  const myQuery = useQuery({
    queryKey: ['visitors', 'my'],
    queryFn: () => visitorsService.getMy(),
    enabled: user?.role === Role.RESIDENT,
  });

  const visitors: Visitor[] = isStaffView ? logQuery.data ?? [] : myQuery.data ?? [];
  const isLoading = isStaffView ? logQuery.isLoading : myQuery.isLoading;

  const columns: Column<Visitor>[] = [
    { header: t('visitorName'), accessor: (v) => v.visitorName },
    { header: commonT('phone'), accessor: (v) => v.phone ?? '-' },
    { header: t('visitorType'), accessor: (v) => <Badge>{t(v.visitorType)}</Badge> },
    {
      header: commonT('status'),
      accessor: (v) => <StatusBadge status={v.verificationStatus} />,
    },
    { header: 'Entry', accessor: (v) => formatDateTime(v.entryTime) },
    { header: 'Exit', accessor: (v) => formatDateTime(v.exitTime) },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        action={
          user?.role === Role.RESIDENT ? (
            <Link href="/dashboard/visitors/pre-register">
              <Button>
                <Plus className="h-4 w-4" />
                {t('preRegister')}
              </Button>
            </Link>
          ) : user?.role === Role.GUARD ? (
            <Link href="/dashboard/visitors/gate">
              <Button>{t('gateTerminal')}</Button>
            </Link>
          ) : undefined
        }
      />

      {user?.role === Role.RESIDENT && <PendingApprovals />}

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : (
        <Table
          columns={columns}
          data={visitors}
          keyExtractor={(v) => v.id}
          emptyMessage={commonT('noData')}
        />
      )}
    </div>
  );
}
