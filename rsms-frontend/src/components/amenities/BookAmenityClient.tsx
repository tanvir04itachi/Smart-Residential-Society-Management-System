'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from '@/i18n/navigation';
import { amenitiesService } from '@/services/amenities.service';
import { bookAmenitySchema, type BookAmenityFormValues } from '@/schemas/amenity.schema';
import { Role } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function BookAmenityContent({ id }: { id: string }) {
  const t = useTranslations('amenities');
  const commonT = useTranslations('common');
  const router = useRouter();

  const { data: slots, isLoading } = useQuery({
    queryKey: ['amenities', id, 'slots'],
    queryFn: () => amenitiesService.getSlots(id),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookAmenityFormValues>({ resolver: zodResolver(bookAmenitySchema) });

  async function onSubmit(values: BookAmenityFormValues) {
    try {
      await amenitiesService.book(id, values);
      toast.success(t('bookingCreated'));
      router.push('/dashboard/amenities');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title={t('bookSlot')} />
      <Card>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">{commonT('loading')}</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Select
                label={t('slots')}
                placeholder={commonT('all')}
                options={(slots ?? []).map((s) => ({
                  value: s.id,
                  label: `${DAYS[s.dayOfWeek]} ${s.startTime}-${s.endTime}`,
                }))}
                error={errors.slotId?.message}
                {...register('slotId')}
              />
              <Input
                label={t('bookingDate')}
                type="date"
                error={errors.bookingDate?.message}
                {...register('bookingDate')}
              />
              <Button type="submit" isLoading={isSubmitting}>
                {commonT('confirm')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function BookAmenityClient({ id }: { id: string }) {
  return (
    <RoleGuard roles={[Role.RESIDENT]}>
      <BookAmenityContent id={id} />
    </RoleGuard>
  );
}
