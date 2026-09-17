'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { residentsService } from '@/services/residents.service';
import { Role, type Resident } from '@/types';

function ResidentsPageContent() {
  const t = useTranslations('residents');
  const commonT = useTranslations('common');

  const { data: residents, isLoading } = useQuery({
    queryKey: ['residents'],
    queryFn: () => residentsService.getAll(),
  });

  const columns: Column<Resident>[] = [
    { header: commonT('name'), accessor: (r) => r.user?.fullName ?? '-' },
    { header: commonT('email'), accessor: (r) => r.user?.email ?? '-' },
    {
      header: t('flat'),
      accessor: (r) =>
        r.flat ? `${r.flat.block?.name ?? ''}-${r.flat.flatNumber}` : '-',
    },
    { header: t('type'), accessor: (r) => t(r.type) },
    {
      header: commonT('status'),
      accessor: (r) => (
        <Badge tone={r.isActive ? 'green' : 'slate'}>
          {r.isActive ? commonT('yes') : commonT('no')}
        </Badge>
      ),
    },
    {
      header: commonT('actions'),
      accessor: (r) => (
        <Link href={`/dashboard/residents/${r.id}`} className="text-sm text-blue-600 hover:underline">
          {commonT('view')}
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        action={
          <Link href="/dashboard/residents/new">
            <Button>
              <Plus className="h-4 w-4" />
              {t('newResident')}
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : (
        <Table columns={columns} data={residents ?? []} keyExtractor={(r) => r.id} />
      )}
    </div>
  );
}

export default function ResidentsPage() {
  return (
    <RoleGuard roles={[Role.MANAGER]}>
      <ResidentsPageContent />
    </RoleGuard>
  );
}
