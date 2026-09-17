'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/navigation';
import { visitorsService } from '@/services/visitors.service';
import {
  preRegisterVisitorSchema,
  type PreRegisterVisitorFormValues,
  type PreRegisterVisitorFormInput,
} from '@/schemas/visitor.schema';
import { Role, VisitorType } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

function PreRegisterContent() {
  const t = useTranslations('visitors');
  const commonT = useTranslations('common');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PreRegisterVisitorFormInput, unknown, PreRegisterVisitorFormValues>({
    resolver: zodResolver(preRegisterVisitorSchema),
    defaultValues: { visitorType: VisitorType.REGULAR },
  });

  async function onSubmit(values: PreRegisterVisitorFormValues) {
    try {
      await visitorsService.preRegister({
        ...values,
        phone: values.phone || undefined,
        purpose: values.purpose || undefined,
        expectedArrival: values.expectedArrival
          ? new Date(values.expectedArrival).toISOString()
          : undefined,
      });
      toast.success(t('visitorPreRegistered'));
      router.push('/dashboard/visitors');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t('preRegister')} />
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label={t('visitorName')}
              error={errors.visitorName?.message}
              {...register('visitorName')}
            />
            <Input
              label={commonT('phone')}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label={t('purpose')}
              error={errors.purpose?.message}
              {...register('purpose')}
            />
            <Select
              label={t('visitorType')}
              options={Object.values(VisitorType).map((v) => ({
                value: v,
                label: t(v),
              }))}
              error={errors.visitorType?.message}
              {...register('visitorType')}
            />
            <Input
              label={t('expectedArrival')}
              type="datetime-local"
              error={errors.expectedArrival?.message}
              {...register('expectedArrival')}
            />
            <Button type="submit" isLoading={isSubmitting}>
              {commonT('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PreRegisterVisitorPage() {
  return (
    <RoleGuard roles={[Role.RESIDENT]}>
      <PreRegisterContent />
    </RoleGuard>
  );
}
