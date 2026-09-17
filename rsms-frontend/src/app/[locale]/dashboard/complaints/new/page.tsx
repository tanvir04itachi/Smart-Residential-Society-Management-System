'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/navigation';
import { complaintsService } from '@/services/complaints.service';
import {
  createComplaintSchema,
  type CreateComplaintFormValues,
  type CreateComplaintFormInput,
} from '@/schemas/complaint.schema';
import { ComplaintCategory, ComplaintPriority, Role } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

function NewComplaintContent() {
  const t = useTranslations('complaints');
  const commonT = useTranslations('common');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateComplaintFormInput, unknown, CreateComplaintFormValues>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: { priority: ComplaintPriority.MEDIUM },
  });

  async function onSubmit(values: CreateComplaintFormValues) {
    try {
      await complaintsService.create(values);
      toast.success(t('complaintCreated'));
      router.push('/dashboard/complaints');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t('newComplaint')} />
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Title"
              error={errors.title?.message}
              {...register('title')}
            />
            <Textarea
              label={commonT('description')}
              error={errors.description?.message}
              {...register('description')}
            />
            <Select
              label={t('category')}
              options={Object.values(ComplaintCategory).map((c) => ({
                value: c,
                label: t(c),
              }))}
              error={errors.category?.message}
              {...register('category')}
            />
            <Select
              label={t('priority')}
              options={Object.values(ComplaintPriority).map((p) => ({
                value: p,
                label: t(p),
              }))}
              error={errors.priority?.message}
              {...register('priority')}
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

export default function NewComplaintPage() {
  return (
    <RoleGuard roles={[Role.RESIDENT]}>
      <NewComplaintContent />
    </RoleGuard>
  );
}
