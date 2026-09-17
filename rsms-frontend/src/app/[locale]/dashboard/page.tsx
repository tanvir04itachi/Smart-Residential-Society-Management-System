'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  ClipboardList,
  Wallet,
  ShieldCheck,
  CalendarCheck,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';
import { reportsService } from '@/services/reports.service';
import { billingService } from '@/services/billing.service';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="lift-on-hover overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eeeaff] text-[#6655c5]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardHomePage() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();

  const managerStats = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => reportsService.dashboard(),
    enabled: user?.role === Role.MANAGER,
  });

  const billingStats = useQuery({
    queryKey: ['billing', 'dashboard'],
    queryFn: () => billingService.dashboard(),
    enabled: user?.role === Role.ACCOUNTANT,
  });

  return (
    <div className="mx-auto max-w-[1440px]">
      <section className="soft-grid relative mb-6 overflow-hidden rounded-3xl bg-[#6655c5] px-5 py-6 text-white shadow-xl shadow-[#6655c5]/15 sm:px-8 sm:py-8">
        <div className="relative z-10 max-w-xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#dcd6ff]"><Sparkles className="h-4 w-4" /> A calmer way to manage home life</div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('welcome', { name: user?.fullName ?? '' })}</h1>
          <p className="mt-2 text-sm text-[#e7e3ff]">Your community is looking good today. Here&apos;s the latest at a glance.</p>
        </div>
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-[28px] border-[#8d80df]/40 sm:right-12" />
        <div className="absolute -bottom-20 right-10 h-40 w-40 rounded-full bg-[#84cbb1]/35 blur-2xl" />
        <p className="relative z-10 mt-6 text-xs font-medium text-[#dcd6ff] sm:absolute sm:bottom-6 sm:right-8 sm:mt-0">{user ? new Date().toLocaleDateString('en-GB', { dateStyle: 'full' }) : ''}</p>
      </section>

      {user?.role === Role.MANAGER && managerStats.data && (
        <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={ClipboardList}
            label={t('openComplaints')}
            value={managerStats.data.openComplaints}
          />
          <KpiCard
            icon={Wallet}
            label={t('overdueBills')}
            value={managerStats.data.overdueBills}
          />
          <KpiCard
            icon={ShieldCheck}
            label={t('todayVisitors')}
            value={managerStats.data.todayVisitors}
          />
          <KpiCard
            icon={CalendarCheck}
            label={t('activeBookings')}
            value={managerStats.data.activeBookings}
          />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <DashboardCharts mode="manager" values={[managerStats.data.openComplaints, managerStats.data.overdueBills, managerStats.data.todayVisitors, managerStats.data.activeBookings]} />
          <Card className="overflow-hidden bg-[#fffaf1]">
            <CardContent className="flex h-full flex-col justify-between p-6">
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#b78345]">Quick access</p><h2 className="text-xl font-bold tracking-tight text-slate-900">Keep your community moving</h2><p className="mt-2 text-sm leading-6 text-slate-600">Jump into the areas that usually need your attention first.</p></div>
              <div className="mt-8 grid gap-2">
                <Link href="/dashboard/complaints" className="group flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-[#5949b6]"><span className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-[#6655c5]" /> Review complaints</span><ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
                <Link href="/dashboard/visitors" className="group flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-[#5949b6]"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#14745e]" /> Check visitor log</span><ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
              </div>
            </CardContent>
          </Card>
        </div>
        </>
      )}

      {user?.role === Role.ACCOUNTANT && billingStats.data && (
        <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={Wallet}
            label={t('totalBilled')}
            value={formatCurrency(billingStats.data.totalBilled)}
          />
          <KpiCard
            icon={Wallet}
            label={t('totalCollected')}
            value={formatCurrency(billingStats.data.totalCollected)}
          />
          <KpiCard
            icon={ClipboardList}
            label={t('pendingCount')}
            value={billingStats.data.pendingCount}
          />
          <KpiCard
            icon={ClipboardList}
            label={t('overdueCount')}
            value={billingStats.data.overdueCount}
          />
        </div>
        <div className="mt-6"><DashboardCharts mode="accountant" values={[billingStats.data.totalBilled, billingStats.data.totalCollected, billingStats.data.pendingCount, billingStats.data.overdueCount]} /></div>
        </>
      )}

      {(user?.role === Role.RESIDENT ||
        user?.role === Role.GUARD ||
        user?.role === Role.MAINTENANCE) && (
        <Card className="mt-6 overflow-hidden bg-gradient-to-br from-white to-[#f1fffa]">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-lg font-bold text-slate-900">Your community, in one place</p><p className="mt-1 text-sm text-slate-600">Use the navigation to manage your tasks and stay connected.</p></div>
            <Link href="/dashboard/announcements" className="btn w-full rounded-xl border-0 bg-[#e9f8f2] text-[#14745e] hover:bg-[#d5f1e6] sm:w-auto">View announcements <ArrowUpRight className="h-4 w-4" /></Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
