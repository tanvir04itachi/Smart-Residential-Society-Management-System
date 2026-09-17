'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { residentsService } from '@/services/residents.service';
import {
  updateResidentSchema,
  type UpdateResidentFormValues,
} from '@/schemas/resident.schema';
import { Role } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

export function ResidentDetailClient({ id }: { id: string }) {
  const t = useTranslations('residents');
  const commonT = useTranslations('common');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: resident, isLoading } = useQuery({
    queryKey: ['residents', id],
    queryFn: () => residentsService.getById(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateResidentFormValues>({
    resolver: zodResolver(updateResidentSchema),
  });

  useEffect(() => {
    if (resident) {
      reset({
        emergencyContact: resident.emergencyContact ?? '',
        isActive: resident.isActive,
      });
    }
  }, [resident, reset]);

  const canEdit =
    user?.role === Role.MANAGER || user?.id === resident?.userId;

  async function onSubmit(values: UpdateResidentFormValues) {
    try {
      await residentsService.update(id, values);
      toast.success(t('profileUpdated'));
      queryClient.invalidateQueries({ queryKey: ['residents', id] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  if (isLoading || !resident) {
    return <p className="text-sm text-slate-500">{commonT('loading')}</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={resident.user?.fullName ?? ''} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{commonT('description')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-slate-500">{commonT('email')}:</span>{' '}
            {resident.user?.email}
          </p>
          <p>
            <span className="text-slate-500">{t('flat')}:</span>{' '}
            {resident.flat
              ? `${resident.flat.block?.name ?? ''}-${resident.flat.flatNumber}`
              : '-'}
          </p>
          <p>
            <span className="text-slate-500">{t('type')}:</span> {t(resident.type)}
          </p>
          <p>
            <span className="text-slate-500">{t('moveInDate')}:</span>{' '}
            {resident.moveInDate ?? '-'}
          </p>
        </CardContent>
      </Card>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>{commonT('edit')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label={t('emergencyContact')}
                error={errors.emergencyContact?.message}
                {...register('emergencyContact')}
              />
              <Button type="submit" isLoading={isSubmitting} className="w-fit">
                {commonT('save')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
