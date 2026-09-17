'use client';

import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { billingService } from '@/services/billing.service';
import { BillStatus, type Bill } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function BillCard({ bill }: { bill: Bill }) {
  const t = useTranslations('billing');
  const commonT = useTranslations('common');

  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">
            {bill.month}/{bill.year}
          </p>
          <p className="text-xs text-slate-500">
            {t('dueDate')}: {formatDate(bill.dueDate)}
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatCurrency(bill.totalAmount)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={bill.status} />
          <div className="flex gap-2">
            {bill.status === BillStatus.PAID && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => billingService.downloadReceipt(bill.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Link href={`/dashboard/billing/${bill.id}`}>
              <Button size="sm">{commonT('view')}</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
