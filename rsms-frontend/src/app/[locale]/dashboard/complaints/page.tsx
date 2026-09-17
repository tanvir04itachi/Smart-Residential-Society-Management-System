'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePagination } from '@/hooks/usePagination';
import { complaintsService } from '@/services/complaints.service';
import { ComplaintStatus, Role, type Complaint } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ComplaintsPage() {
  const t = useTranslations('complaints');
  const commonT = useTranslations('common');
  const { user } = useAuth();
  const { page, limit, setPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | ''>('');

  const isManager = user?.role === Role.MANAGER;
  const isMaintenance = user?.role === Role.MAINTENANCE;
  const isResident = user?.role === Role.RESIDENT;

  const allQuery = useQuery({
    queryKey: ['complaints', 'all', page, limit, statusFilter],
    queryFn: () =>
      complaintsService.getAll({ page, limit, status: statusFilter || undefined }),
    enabled: isManager,
  });

  const assignedQuery = useQuery({
    queryKey: ['complaints', 'assigned'],
    queryFn: () => complaintsService.getAssigned(),
    enabled: isMaintenance,
  });

  const myQuery = useQuery({
    queryKey: ['complaints', 'my'],
    queryFn: () => complaintsService.getMy(),
    enabled: isResident,
  });

  const complaints: Complaint[] = isManager
    ? allQuery.data?.data ?? []
    : isMaintenance
      ? assignedQuery.data ?? []
      : myQuery.data ?? [];

  const isLoading = isManager
    ? allQuery.isLoading
    : isMaintenance
      ? assignedQuery.isLoading
      : myQuery.isLoading;

  const columns: Column<Complaint>[] = [
    { header: 'Title', accessor: (c) => c.title },
    { header: t('category'), accessor: (c) => t(c.category) },
    { header: t('priority'), accessor: (c) => t(c.priority) },
    { header: commonT('status'), accessor: (c) => <StatusBadge status={c.status} /> },
    ...(isManager || isMaintenance
      ? [
          {
            header: 'Resident',
            accessor: (c: Complaint) => c.resident?.user?.fullName ?? '-',
          } as Column<Complaint>,
        ]
      : []),
    { header: commonT('date'), accessor: (c) => formatDate(c.createdAt) },
    {
      header: commonT('actions'),
      accessor: (c) => (
        <Link
          href={`/dashboard/complaints/${c.id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          {commonT('view')}
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={
          isManager ? t('title') : isMaintenance ? t('assignedToMe') : t('myComplaints')
        }
        action={
          isResident ? (
            <Link href="/dashboard/complaints/new">
              <Button>
                <Plus className="h-4 w-4" />
                {t('newComplaint')}
              </Button>
            </Link>
          ) : undefined
        }
      />

      {isManager && (
        <div className="mb-4 max-w-xs">
          <Select
            placeholder={commonT('all')}
            options={Object.values(ComplaintStatus).map((s) => ({
              value: s,
              label: t(s),
            }))}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ComplaintStatus | '');
              setPage(1);
            }}
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : (
        <>
          <Table
            columns={columns}
            data={complaints}
            keyExtractor={(c) => c.id}
            emptyMessage={commonT('noData')}
          />
          {isManager && allQuery.data && (
            <Pagination
              page={allQuery.data.meta.page}
              totalPages={allQuery.data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
