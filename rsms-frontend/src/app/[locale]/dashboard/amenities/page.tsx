'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Table, type Column } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { amenitiesService } from '@/services/amenities.service';
import {
  createAmenitySchema,
  type CreateAmenityFormValues,
  type CreateAmenityFormInput,
} from '@/schemas/amenity.schema';
import { Role, type Booking } from '@/types';
import { formatDate } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

function CreateAmenityModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('amenities');
  const commonT = useTranslations('common');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAmenityFormInput, unknown, CreateAmenityFormValues>({
    resolver: zodResolver(createAmenitySchema),
  });

  async function onSubmit(values: CreateAmenityFormValues) {
    try {
      await amenitiesService.create({
        ...values,
        description: values.description || undefined,
        location: values.location || undefined,
      });
      toast.success(commonT('success'));
      reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('newAmenity')}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label={commonT('name')} error={errors.name?.message} {...register('name')} />
        <Input
          label={commonT('description')}
          error={errors.description?.message}
          {...register('description')}
        />
        <Input
          label={t('capacity')}
          type="number"
          error={errors.capacity?.message}
          {...register('capacity')}
        />
        <Input
          label={t('location')}
          error={errors.location?.message}
          {...register('location')}
        />
        <Button type="submit" isLoading={isSubmitting}>
          {commonT('create')}
        </Button>
      </form>
    </Modal>
  );
}

function MyBookings() {
  const t = useTranslations('amenities');
  const commonT = useTranslations('common');
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['amenities', 'bookings', 'my'],
    queryFn: () => amenitiesService.getMyBookings(),
  });

  async function handleCancel(id: string) {
    try {
      await amenitiesService.cancelBooking(id);
      toast.success(commonT('success'));
      queryClient.invalidateQueries({ queryKey: ['amenities', 'bookings', 'my'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const columns: Column<Booking>[] = [
    { header: t('title'), accessor: (b) => b.amenity?.name ?? '-' },
    { header: t('bookingDate'), accessor: (b) => formatDate(b.bookingDate) },
    { header: commonT('status'), accessor: (b) => <StatusBadge status={b.status} /> },
    {
      header: commonT('actions'),
      accessor: (b) =>
        b.status === 'CONFIRMED' ? (
          <Button size="sm" variant="danger" onClick={() => handleCancel(b.id)}>
            {t('cancelBooking')}
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{t('myBookings')}</h2>
      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : (
        <Table
          columns={columns}
          data={bookings ?? []}
          keyExtractor={(b) => b.id}
          emptyMessage={commonT('noData')}
        />
      )}
    </div>
  );
}

export default function AmenitiesPage() {
  const t = useTranslations('amenities');
  const commonT = useTranslations('common');
  const { user } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const { data: amenities, isLoading } = useQuery({
    queryKey: ['amenities'],
    queryFn: () => amenitiesService.getAll(),
  });

  return (
    <div>
      <PageHeader
        title={t('title')}
        action={
          user?.role === Role.MANAGER ? (
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              {t('newAmenity')}
            </Button>
          ) : undefined
        }
      />

      {user?.role === Role.RESIDENT && <MyBookings />}

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(amenities ?? []).map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <CardTitle>{a.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{a.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {t('capacity')}: {a.capacity ?? '-'} · {t('location')}: {a.location ?? '-'}
                </p>
                {user?.role === Role.RESIDENT && (
                  <Link href={`/dashboard/amenities/book/${a.id}`}>
                    <Button size="sm" className="mt-3">
                      {t('bookSlot')}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateAmenityModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
