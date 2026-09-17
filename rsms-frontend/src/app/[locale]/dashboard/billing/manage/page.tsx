'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Table, type Column } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { billingService } from '@/services/billing.service';
import {
  configureBillingSchema,
  generateBillsSchema,
  type ConfigureBillingFormValues,
  type ConfigureBillingFormInput,
  type GenerateBillsFormValues,
  type GenerateBillsFormInput,
} from '@/schemas/billing.schema';
import { BillStatus, Role, type Bill } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';
import { flatsService } from '@/services/flats.service';
import { getFlatTypeOptions } from '@/lib/flat-types';

function ManageBillingContent() {
  const t = useTranslations('billing');
  const commonT = useTranslations('common');
  const queryClient = useQueryClient();
  const { page, limit, setPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState<BillStatus | ''>('');

  const { data: configs } = useQuery({
    queryKey: ['billing', 'config'],
    queryFn: () => billingService.getConfig(),
  });

  const { data: bills, isLoading } = useQuery({
    queryKey: ['billing', 'bills', page, limit, statusFilter],
    queryFn: () =>
      billingService.getAllBills({ page, limit, status: statusFilter || undefined }),
  });

  const { data: flats } = useQuery({
    queryKey: ['flats'],
    queryFn: () => flatsService.getAll(),
  });

  const flatTypeOptions = getFlatTypeOptions([
    ...(flats ?? []).map((flat) => flat.flatType),
    ...(configs ?? []).map((config) => config.flatType),
  ]);

  const configForm = useForm<ConfigureBillingFormInput, unknown, ConfigureBillingFormValues>({
    resolver: zodResolver(configureBillingSchema),
    defaultValues: {
      extraVehicleCharge: 0,
      commercialSurcharge: 0,
      latePenaltyPercent: 2,
      billingDay: 1,
    },
  });

  const generateForm = useForm<GenerateBillsFormInput, unknown, GenerateBillsFormValues>({
    resolver: zodResolver(generateBillsSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  });

  async function onConfigSubmit(values: ConfigureBillingFormValues) {
    try {
      await billingService.upsertConfig(values);
      toast.success(t('configSaved'));
      queryClient.invalidateQueries({ queryKey: ['billing', 'config'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function onGenerateSubmit(values: GenerateBillsFormValues) {
    try {
      await billingService.generate(values);
      toast.success(t('billsGenerated'));
      queryClient.invalidateQueries({ queryKey: ['billing', 'bills'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const columns: Column<Bill>[] = [
    { header: commonT('name'), accessor: (b) => b.resident?.user?.fullName ?? '-' },
    { header: t('block'), accessor: (b) => b.resident?.flat?.block?.name ?? '-' },
    { header: t('floor'), accessor: (b) => b.resident?.flat?.floorNumber ?? '-' },
    { header: t('flatNumber'), accessor: (b) => b.resident?.flat?.flatNumber ?? '-' },
    { header: t('flatType'), accessor: (b) => b.resident?.flat?.flatType ?? '-' },
    { header: `${t('month')}/${t('year')}`, accessor: (b) => `${b.month}/${b.year}` },
    { header: commonT('amount'), accessor: (b) => formatCurrency(b.totalAmount) },
    { header: t('dueDate'), accessor: (b) => formatDate(b.dueDate) },
    { header: commonT('status'), accessor: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <div>
      <PageHeader title={t('manageBilling')} />
      <p className="-mt-3 mb-6 max-w-3xl text-sm leading-6 text-slate-600">{t('manageBillingHint')}</p>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('config')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={configForm.handleSubmit(onConfigSubmit)}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <Select
                label={t('flatType')}
                placeholder={t('selectFlatType')}
                options={flatTypeOptions}
                error={configForm.formState.errors.flatType?.message}
                {...configForm.register('flatType')}
              />
              <Input
                label={t('baseAmount')}
                type="number"
                error={configForm.formState.errors.baseAmount?.message}
                {...configForm.register('baseAmount')}
              />
              <Input
                label={t('extraVehicleCharge')}
                type="number"
                error={configForm.formState.errors.extraVehicleCharge?.message}
                {...configForm.register('extraVehicleCharge')}
              />
              <Input
                label={t('commercialSurcharge')}
                type="number"
                error={configForm.formState.errors.commercialSurcharge?.message}
                {...configForm.register('commercialSurcharge')}
              />
              <Input
                label={t('latePenaltyPercent')}
                type="number"
                error={configForm.formState.errors.latePenaltyPercent?.message}
                {...configForm.register('latePenaltyPercent')}
              />
              <Select
                label={t('billingDay')}
                options={Array.from({ length: 28 }, (_, index) => {
                  const day = index + 1;
                  return { value: String(day), label: String(day) };
                })}
                error={configForm.formState.errors.billingDay?.message}
                {...configForm.register('billingDay')}
              />
              <Button
                type="submit"
                isLoading={configForm.formState.isSubmitting}
                className="w-fit sm:col-span-2"
              >
                {commonT('save')}
              </Button>
            </form>

            {!!configs?.length && (
              <div className="mt-4 space-y-1 text-xs text-slate-500">
                {configs.map((c) => (
                  <p key={c.id}>
                    {c.flatType}: {formatCurrency(c.baseAmount)}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('generateBills')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={generateForm.handleSubmit(onGenerateSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label={t('month')}
                  options={Array.from({ length: 12 }, (_, index) => {
                    const month = index + 1;
                    return { value: String(month), label: String(month) };
                  })}
                  error={generateForm.formState.errors.month?.message}
                  {...generateForm.register('month')}
                />
                <Select
                  label={t('year')}
                  options={Array.from({ length: 5 }, (_, index) => {
                    const year = new Date().getFullYear() - 1 + index;
                    return { value: String(year), label: String(year) };
                  })}
                  error={generateForm.formState.errors.year?.message}
                  {...generateForm.register('year')}
                />
              </div>
              <Button type="submit" isLoading={generateForm.formState.isSubmitting} className="w-fit">
                {t('generateBills')}
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <Button
                variant="outline"
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
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 max-w-xs">
        <Select
          placeholder={commonT('all')}
          options={Object.values(BillStatus).map((s) => ({ value: s, label: t(s) }))}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as BillStatus | '');
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : (
        <>
          <Table columns={columns} data={bills?.data ?? []} keyExtractor={(b) => b.id} />
          {bills && (
            <Pagination page={bills.meta.page} totalPages={bills.meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}

export default function ManageBillingPage() {
  return (
    <RoleGuard roles={[Role.ACCOUNTANT]}>
      <ManageBillingContent />
    </RoleGuard>
  );
}
