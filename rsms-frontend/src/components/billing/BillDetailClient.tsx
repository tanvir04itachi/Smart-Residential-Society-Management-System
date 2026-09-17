'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PaymentModal } from './PaymentModal';
import { billingService } from '@/services/billing.service';
import { BillStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function BillDetailClient({ id }: { id: string }) {
  const t = useTranslations('billing');
  const commonT = useTranslations('common');
  const [payOpen, setPayOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: bill, isLoading } = useQuery({
    queryKey: ['billing', 'bill', id],
    queryFn: () => billingService.getBillById(id),
  });

  async function handlePaymentSuccess() {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['billing', 'bill', id], type: 'all' }),
      queryClient.refetchQueries({ queryKey: ['billing', 'my'], type: 'all' }),
    ]);
  }

  if (isLoading || !bill) {
    return <p className="text-sm text-slate-500">{commonT('loading')}</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title={`${t('title')} - ${bill.month}/${bill.year}`} />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{commonT('status')}</span>
            <StatusBadge status={bill.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{t('baseAmount')}</span>
            <span className="font-medium">{formatCurrency(bill.baseAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Extra charges</span>
            <span className="font-medium">{formatCurrency(bill.extraCharges)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Late penalty</span>
            <span className="font-medium">{formatCurrency(bill.latePenalty)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm font-medium text-slate-700">{commonT('total')}</span>
            <span className="text-lg font-semibold">{formatCurrency(bill.totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{t('dueDate')}</span>
            <span className="font-medium">{formatDate(bill.dueDate)}</span>
          </div>

          <div className="flex gap-2 pt-2">
            {bill.status !== BillStatus.PAID ? (
              <Button onClick={() => setPayOpen(true)}>{t('payNow')}</Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => billingService.downloadReceipt(bill.id)}
              >
                <Download className="h-4 w-4" />
                {t('downloadReceipt')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentModal
        bill={bill}
        isOpen={payOpen}
        onClose={() => setPayOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
