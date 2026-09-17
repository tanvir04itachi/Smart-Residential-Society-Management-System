'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
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
import { announcementsService } from '@/services/announcements.service';
import { blocksService } from '@/services/flats.service';
import {
  createAnnouncementSchema,
  type CreateAnnouncementFormValues,
  type CreateAnnouncementFormInput,
} from '@/schemas/announcement.schema';
import { AnnouncementScope, Role } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

function NewAnnouncementContent() {
  const t = useTranslations('announcements');
  const commonT = useTranslations('common');
  const router = useRouter();

  const { data: blocks } = useQuery({
    queryKey: ['blocks'],
    queryFn: () => blocksService.getAll(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateAnnouncementFormInput, unknown, CreateAnnouncementFormValues>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: { scope: AnnouncementScope.ALL },
  });

  const scope = useWatch({ control, name: 'scope' });

  async function onSubmit(values: CreateAnnouncementFormValues) {
    try {
      await announcementsService.create({
        title: values.title,
        body: values.body,
        scope: values.scope,
        attachmentUrl: values.attachmentUrl || undefined,
        targets:
          values.scope === AnnouncementScope.BLOCK && values.targetBlockId
            ? [{ blockId: values.targetBlockId }]
            : values.scope === AnnouncementScope.FLOOR &&
                values.targetFloorNumber !== undefined
              ? [{ floorNumber: values.targetFloorNumber }]
              : undefined,
      });
      toast.success(t('announcementCreated'));
      router.push('/dashboard/announcements');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t('newAnnouncement')} />
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
              error={errors.body?.message}
              {...register('body')}
            />
            <Select
              label={t('scope')}
              options={Object.values(AnnouncementScope).map((s) => ({
                value: s,
                label: t(s),
              }))}
              error={errors.scope?.message}
              {...register('scope')}
            />
            {scope === AnnouncementScope.BLOCK && (
              <Select
                label={t('targetBlock')}
                placeholder={commonT('all')}
                options={(blocks ?? []).map((b) => ({ value: b.id, label: b.name }))}
                error={errors.targetBlockId?.message}
                {...register('targetBlockId')}
              />
            )}
            {scope === AnnouncementScope.FLOOR && (
              <Input
                label={t('targetFloor')}
                type="number"
                error={errors.targetFloorNumber?.message}
                {...register('targetFloorNumber')}
              />
            )}
            <Input
              label={`Attachment URL (${commonT('optional')})`}
              error={errors.attachmentUrl?.message}
              {...register('attachmentUrl')}
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

export default function NewAnnouncementPage() {
  return (
    <RoleGuard roles={[Role.MANAGER]}>
      <NewAnnouncementContent />
    </RoleGuard>
  );
}
