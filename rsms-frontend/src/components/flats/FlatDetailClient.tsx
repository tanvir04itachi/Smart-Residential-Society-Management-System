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
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { flatsService } from '@/services/flats.service';
import { residentsService } from '@/services/residents.service';
import {
  assignResidentSchema,
  type AssignResidentFormValues,
} from '@/schemas/flat.schema';
import { Role } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

export function FlatDetailClient({ id }: { id: string }) {
  const t = useTranslations('flats');
  const commonT = useTranslations('common');
  const [showAssign, setShowAssign] = useState(false);
  const queryClient = useQueryClient();

  const { data: flat, isLoading } = useQuery({
    queryKey: ['flats', id],
    queryFn: () => flatsService.getById(id),
  });

  const { data: residents } = useQuery({
    queryKey: ['residents'],
    queryFn: () => residentsService.getAll(),
    enabled: showAssign,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AssignResidentFormValues>({
    resolver: zodResolver(assignResidentSchema),
  });

  async function onAssign(values: AssignResidentFormValues) {
    try {
      await flatsService.assign(id, values);
      toast.success(commonT('success'));
      setShowAssign(false);
      queryClient.invalidateQueries({ queryKey: ['flats', id] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function onVacate() {
    try {
      await flatsService.vacate(id);
      toast.success(commonT('success'));
      queryClient.invalidateQueries({ queryKey: ['flats', id] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  if (isLoading || !flat) {
    return <p className="text-sm text-slate-500">{commonT('loading')}</p>;
  }

  const assignableResidents = residents ?? [];

  return (
    <RoleGuard roles={[Role.MANAGER]}>
      <PageHeader
        title={`${flat.block?.name ?? ''}-${flat.flatNumber}`}
        action={
          flat.isOccupied ? (
            <Button variant="danger" onClick={onVacate}>
              {t('vacate')}
            </Button>
          ) : (
            <Button onClick={() => setShowAssign((v) => !v)}>{t('assignResident')}</Button>
          )
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{commonT('description')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-slate-500">{t('floor')}</p>
            <p className="font-medium">{flat.floorNumber}</p>
          </div>
          <div>
            <p className="text-slate-500">{t('flatType')}</p>
            <p className="font-medium">{flat.flatType ?? '-'}</p>
          </div>
          <div>
            <p className="text-slate-500">{t('area')}</p>
            <p className="font-medium">{flat.area ?? '-'}</p>
          </div>
          <div>
            <p className="text-slate-500">{commonT('status')}</p>
            <Badge tone={flat.isOccupied ? 'green' : 'slate'}>
              {flat.isOccupied ? t('occupied') : t('vacant')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {showAssign && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('assignResident')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onAssign)} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Select
                  label={t('assignResident')}
                  placeholder={t('selectResident')}
                  options={assignableResidents.map((r) => ({
                    value: r.id,
                    label: r.user?.fullName ?? r.id,
                  }))}
                  error={errors.residentId?.message}
                  {...register('residentId')}
                />
              </div>
              <Button type="submit" isLoading={isSubmitting}>
                {commonT('confirm')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('currentResidents')}</CardTitle>
        </CardHeader>
        <CardContent>
          {flat.residents?.length ? (
            <ul className="space-y-2 text-sm">
              {flat.residents.map((r) => (
                <li key={r.id} className="flex justify-between border-b border-slate-100 pb-2">
                  <span>{r.user?.fullName}</span>
                  <span className="text-slate-500">{r.user?.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">{commonT('noData')}</p>
          )}
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
