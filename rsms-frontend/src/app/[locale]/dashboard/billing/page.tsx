'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Wallet, Settings, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { BillCard } from '@/components/billing/BillCard';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { billingService } from '@/services/billing.service';
import { Role } from '@/types';
import { formatCurrency } from '@/lib/utils';

function AccountantOverview() {
  const t = useTranslations('billing');
  const { data } = useQuery({
    queryKey: ['billing', 'dashboard'],
    queryFn: () => billingService.dashboard(),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-xs text-slate-500">Total Billed</p>
            <p className="text-xl font-semibold">{formatCurrency(data?.totalBilled)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-slate-500">Total Collected</p>
            <p className="text-xl font-semibold">{formatCurrency(data?.totalCollected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-slate-500">Pending</p>
            <p className="text-xl font-semibold">{data?.pendingCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-slate-500">Overdue</p>
            <p className="text-xl font-semibold">{data?.overdueCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/billing/manage">
          <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Settings className="h-4 w-4" />
            {t('manageBilling')}
          </button>
        </Link>
        <Link href="/dashboard/billing/defaulters">
          <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Users className="h-4 w-4" />
            {t('defaulters')}
          </button>
        </Link>
      </div>

      <Card className="overflow-hidden bg-gradient-to-br from-white to-[#f1fffa]">
        <CardContent className="p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#14745e]">{t('billingWorkflow')}</p>
          <h2 className="mt-2 text-xl font-bold">{t('manageBillingHint')}</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[t('workflowStepOne'), t('workflowStepTwo'), t('workflowStepThree')].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-xl bg-white/70 p-3 text-sm font-semibold">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e9f8f2] text-[#14745e]">{index + 1}</span>
                <span>{step}</span>
                {index === 2 && <CheckCircle2 className="ml-auto h-4 w-4 text-[#14745e]" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ManagerOverview() {
  const t = useTranslations('billing');
  return (
    <Link href="/dashboard/billing/defaulters">
      <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <Wallet className="h-4 w-4" />
        {t('defaulters')}
      </button>
    </Link>
  );
}

function ResidentBills() {
  const t = useTranslations('billing');
  const commonT = useTranslations('common');

  const { data: bills, isLoading } = useQuery({
    queryKey: ['billing', 'my'],
    queryFn: () => billingService.getMyBills(),
  });

  if (isLoading) return <p className="text-sm text-slate-500">{commonT('loading')}</p>;

  if (!bills?.length) {
    return (
      <Card className="overflow-hidden bg-gradient-to-br from-white to-[#f1fffa]">
        <CardContent className="p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeeaff] text-[#6655c5]"><Wallet className="h-5 w-5" /></div>
          <h2 className="mt-5 text-xl font-bold">{t('noBillsTitle')}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('noBillsText')}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#14745e]" /> {t('paymentMethodsHint')}</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <span>{t('payNow')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bills.map((bill) => (
        <BillCard key={bill.id} bill={bill} />
      ))}
    </div>
  );
}

export default function BillingPage() {
  const t = useTranslations('billing');
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={user?.role === Role.RESIDENT ? t('myBills') : t('title')}
      />
      {user?.role === Role.RESIDENT && <ResidentBills />}
      {user?.role === Role.ACCOUNTANT && <AccountantOverview />}
      {user?.role === Role.MANAGER && <ManagerOverview />}
    </div>
  );
}
