'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { reportsService } from '@/services/reports.service';
import { Role } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

type Format = 'pdf' | 'excel';

function ReportCard({
  title,
  onDownload,
}: {
  title: string;
  onDownload: (format: Format) => Promise<void>;
}) {
  const t = useTranslations('reports');
  const [format, setFormat] = useState<Format>('pdf');
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      await onDownload(format);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end gap-3">
        <div className="w-32">
          <Select
            label={t('format')}
            options={[
              { value: 'pdf', label: t('pdf') },
              { value: 'excel', label: t('excel') },
            ]}
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
          />
        </div>
        <Button onClick={handleDownload} isLoading={loading}>
          <Download className="h-4 w-4" />
          Download
        </Button>
      </CardContent>
    </Card>
  );
}

function ReportsContent() {
  const t = useTranslations('reports');
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title={t('title')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {user?.role === Role.MANAGER && (
          <ReportCard
            title={t('complaintsReport')}
            onDownload={(f) => reportsService.downloadComplaintsReport(f)}
          />
        )}
        {user?.role === Role.ACCOUNTANT && (
          <ReportCard
            title={t('billingReport')}
            onDownload={(f) => reportsService.downloadBillingReport(f)}
          />
        )}
        {user?.role === Role.MANAGER && (
          <ReportCard
            title={t('visitorsReport')}
            onDownload={(f) => reportsService.downloadVisitorsReport(f)}
          />
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <RoleGuard roles={[Role.MANAGER, Role.ACCOUNTANT]}>
      <ReportsContent />
    </RoleGuard>
  );
}
