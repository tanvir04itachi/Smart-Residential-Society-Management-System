'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { billingService } from '@/services/billing.service';
import { Role, type Bill } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

function DefaultersContent() {
  const t = useTranslations('billing');
  const commonT = useTranslations('common');
  const { user } = useAuth();

  const { data: bills, isLoading } = useQuery({
    queryKey: ['billing', 'defaulters'],
    queryFn: () => billingService.defaulters(),
  });

  const columns: Column<Bill>[] = [
    { header: commonT('name'), accessor: (b) => b.resident?.user?.fullName ?? '-' },
    { header: commonT('email'), accessor: (b) => b.resident?.user?.email ?? '-' },
    { header: `${t('month')}/${t('year')}`, accessor: (b) => `${b.month}/${b.year}` },
    { header: commonT('amount'), accessor: (b) => formatCurrency(b.totalAmount) },
    { header: t('dueDate'), accessor: (b) => formatDate(b.dueDate) },
    { header: commonT('status'), accessor: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title={t('defaulters')}
        action={
          user?.role === Role.ACCOUNTANT ? (
            <Button
              onClick={async () => {
                try {
                  await billingService.sendReminders();
                  toast.success(commonT('success'));
                } catch (error) {
                  toast.error(getApiErrorMessage(error));
                }
              }}
            >
              {t('sendReminders')}
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : (
        <Table
          columns={columns}
          data={bills ?? []}
          keyExtractor={(b) => b.id}
          emptyMessage={commonT('noData')}
        />
      )}
    </div>
  );
}

export default function DefaultersPage() {
  return (
    <RoleGuard roles={[Role.ACCOUNTANT, Role.MANAGER]}>
      <DefaultersContent />
    </RoleGuard>
  );
}
