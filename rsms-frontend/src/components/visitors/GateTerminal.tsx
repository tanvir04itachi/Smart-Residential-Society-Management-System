'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Search, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { visitorsService } from '@/services/visitors.service';
import { flatsService } from '@/services/flats.service';
import {
  walkInVisitorSchema,
  type WalkInVisitorFormValues,
  type WalkInVisitorFormInput,
  type FlagVisitorFormValues,
} from '@/schemas/visitor.schema';
import { VisitorType, VisitorStatus, type Visitor } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

export function GateTerminal() {
  const t = useTranslations('visitors');
  const commonT = useTranslations('common');
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ['visitors', 'search', activeSearch],
    queryFn: () => visitorsService.search(activeSearch),
    enabled: activeSearch.length > 0,
  });

  const { data: flats } = useQuery({
    queryKey: ['flats'],
    queryFn: () => flatsService.getAll(),
  });

  const walkInForm = useForm<WalkInVisitorFormInput, unknown, WalkInVisitorFormValues>({
    resolver: zodResolver(walkInVisitorSchema),
    defaultValues: { visitorType: VisitorType.REGULAR },
  });

  async function handleEntry(id: string) {
    try {
      await visitorsService.entry(id);
      toast.success(commonT('success'));
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleExit(id: string) {
    try {
      await visitorsService.exit(id);
      toast.success(commonT('success'));
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleFlag(id: string, values: FlagVisitorFormValues) {
    try {
      await visitorsService.flag(id, values);
      toast.success(commonT('success'));
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function onWalkInSubmit(values: WalkInVisitorFormValues) {
    try {
      await visitorsService.walkIn({
        ...values,
        phone: values.phone || undefined,
        purpose: values.purpose || undefined,
      });
      toast.success(t('walkInLogged'));
      walkInForm.reset({ visitorType: VisitorType.REGULAR, flatId: '', visitorName: '' });
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('searchPlaceholder')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveSearch(searchTerm);
            }}
            className="flex gap-2"
          >
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" isLoading={isFetching}>
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="space-y-2">
            {(searchResults ?? []).map((v: Visitor) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-md border border-slate-100 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{v.visitorName}</p>
                  <p className="text-xs text-slate-500">{v.phone}</p>
                  <StatusBadge status={v.verificationStatus} />
                </div>
                <div className="flex gap-2">
                  {!v.entryTime && v.verificationStatus !== VisitorStatus.DENIED && (
                    <Button size="sm" onClick={() => handleEntry(v.id)}>
                      {t('entry')}
                    </Button>
                  )}
                  {v.entryTime && !v.exitTime && (
                    <Button size="sm" variant="outline" onClick={() => handleExit(v.id)}>
                      {t('exit')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleFlag(v.id, {})}
                    title={t('flag')}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('walkIn')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={walkInForm.handleSubmit(onWalkInSubmit)} className="flex flex-col gap-4">
            <Input
              label={t('visitorName')}
              error={walkInForm.formState.errors.visitorName?.message}
              {...walkInForm.register('visitorName')}
            />
            <Input
              label={commonT('phone')}
              error={walkInForm.formState.errors.phone?.message}
              {...walkInForm.register('phone')}
            />
            <Input
              label={t('purpose')}
              error={walkInForm.formState.errors.purpose?.message}
              {...walkInForm.register('purpose')}
            />
            <Select
              label={t('visitorType')}
              options={Object.values(VisitorType).map((v) => ({ value: v, label: t(v) }))}
              error={walkInForm.formState.errors.visitorType?.message}
              {...walkInForm.register('visitorType')}
            />
            <Select
              label="Flat"
              placeholder={commonT('all')}
              options={(flats ?? []).map((f) => ({
                value: f.id,
                label: `${f.block?.name ?? ''}-${f.flatNumber}`,
              }))}
              error={walkInForm.formState.errors.flatId?.message}
              {...walkInForm.register('flatId')}
            />
            <Button type="submit" isLoading={walkInForm.formState.isSubmitting}>
              {commonT('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
