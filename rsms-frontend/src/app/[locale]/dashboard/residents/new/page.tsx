'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/navigation';
import { residentsService } from '@/services/residents.service';
import { flatsService } from '@/services/flats.service';
import {
  createResidentSchema,
  type CreateResidentFormValues,
} from '@/schemas/resident.schema';
import { Role, ResidentType } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

function NewResidentContent() {
  const t = useTranslations('residents');
  const commonT = useTranslations('common');
  const router = useRouter();

  const { data: flats } = useQuery({
    queryKey: ['flats'],
    queryFn: () => flatsService.getAll(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateResidentFormValues>({
    resolver: zodResolver(createResidentSchema),
  });

  async function onSubmit(values: CreateResidentFormValues) {
    try {
      await residentsService.create({
        ...values,
        phone: values.phone || undefined,
        password: values.password || undefined,
        flatId: values.flatId || undefined,
        emergencyContact: values.emergencyContact || undefined,
        moveInDate: values.moveInDate || undefined,
      });
      toast.success(t('residentCreated'));
      router.push('/dashboard/residents');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t('newResident')} />
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label={commonT('name')}
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label={commonT('email')}
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label={commonT('phone')}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label={`Password (${commonT('optional')})`}
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Select
              label={t('flat')}
              placeholder={commonT('all')}
              options={(flats ?? [])
                .filter((f) => !f.isOccupied)
                .map((f) => ({
                  value: f.id,
                  label: `${f.block?.name ?? ''}-${f.flatNumber}`,
                }))}
              error={errors.flatId?.message}
              {...register('flatId')}
            />
            <Select
              label={t('type')}
              options={Object.values(ResidentType).map((v) => ({
                value: v,
                label: t(v),
              }))}
              error={errors.type?.message}
              {...register('type')}
            />
            <Input
              label={t('emergencyContact')}
              error={errors.emergencyContact?.message}
              {...register('emergencyContact')}
            />
            <Input
              label={t('moveInDate')}
              type="date"
              error={errors.moveInDate?.message}
              {...register('moveInDate')}
            />
            <Button type="submit" isLoading={isSubmitting}>
              {commonT('create')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewResidentPage() {
  return (
    <RoleGuard roles={[Role.MANAGER]}>
      <NewResidentContent />
    </RoleGuard>
  );
}
