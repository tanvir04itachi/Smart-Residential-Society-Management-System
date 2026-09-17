'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Link } from '@/i18n/navigation';
import { blocksService, flatsService } from '@/services/flats.service';
import {
  createBlockSchema,
  createFlatSchema,
  type CreateBlockFormValues,
  type CreateFlatFormValues,
  type CreateFlatFormInput,
} from '@/schemas/flat.schema';
import { Role, type Flat } from '@/types';
import { getApiErrorMessage } from '@/lib/api';
import { getFlatTypeOptions } from '@/lib/flat-types';

function BlocksSection({
  selectedBlockId,
  onSelectBlock,
}: {
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
}) {
  const t = useTranslations('flats');
  const commonT = useTranslations('common');
  const [isModalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: blocks, isLoading } = useQuery({
    queryKey: ['blocks'],
    queryFn: () => blocksService.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBlockFormValues>({ resolver: zodResolver(createBlockSchema) });

  async function onSubmit(values: CreateBlockFormValues) {
    try {
      await blocksService.create({
        ...values,
        description: values.description || undefined,
      });
      reset();
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{t('blocksTitle')}</h2>
        <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('newBlock')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {blocks?.length ? (
            <>
              <Button
                type="button"
                size="sm"
                variant={selectedBlockId === null ? 'primary' : 'outline'}
                onClick={() => onSelectBlock(null)}
              >
                {commonT('all')}
              </Button>
              {blocks.map((b) => (
                <Button
                  key={b.id}
                  type="button"
                  size="sm"
                  variant={selectedBlockId === b.id ? 'primary' : 'outline'}
                  onClick={() => onSelectBlock(b.id)}
                  aria-pressed={selectedBlockId === b.id}
                >
                  {b.name}
                </Button>
              ))}
            </>
          ) : (
            <p className="text-sm text-slate-400">{commonT('noData')}</p>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={t('newBlock')}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label={commonT('name')}
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label={commonT('description')}
            error={errors.description?.message}
            {...register('description')}
          />
          <Button type="submit" isLoading={isSubmitting}>
            {commonT('create')}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function FlatsSection({ selectedBlockId }: { selectedBlockId: string | null }) {
  const t = useTranslations('flats');
  const commonT = useTranslations('common');
  const [isModalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: flats, isLoading } = useQuery({
    queryKey: ['flats'],
    queryFn: () => flatsService.getAll(),
  });

  const { data: blocks } = useQuery({
    queryKey: ['blocks'],
    queryFn: () => blocksService.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFlatFormInput, unknown, CreateFlatFormValues>({
    resolver: zodResolver(createFlatSchema),
  });

  async function onSubmit(values: CreateFlatFormValues) {
    try {
      await flatsService.create({
        ...values,
        flatType: values.flatType || undefined,
      });
      reset();
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['flats'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const columns: Column<Flat>[] = [
    { header: t('block'), accessor: (f) => f.block?.name ?? '-' },
    { header: t('floor'), accessor: (f) => f.floorNumber },
    { header: t('flatNumber'), accessor: (f) => f.flatNumber },
    { header: t('flatType'), accessor: (f) => f.flatType ?? '-' },
    {
      header: commonT('status'),
      accessor: (f) => (
        <Badge tone={f.isOccupied ? 'green' : 'slate'}>
          {f.isOccupied ? t('occupied') : t('vacant')}
        </Badge>
      ),
    },
    {
      header: commonT('actions'),
      accessor: (f) => (
        <Link href={`/dashboard/flats/${f.id}`} className="text-sm text-blue-600 hover:underline">
          {commonT('view')}
        </Link>
      ),
    },
  ];

  const visibleFlats = (flats ?? []).filter(
    (flat) => selectedBlockId === null || flat.blockId === selectedBlockId,
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{t('title')}</h2>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('newFlat')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : (
        <Table columns={columns} data={visibleFlats} keyExtractor={(f) => f.id} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={t('newFlat')}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Select
            label={t('block')}
            placeholder={commonT('all')}
            options={(blocks ?? []).map((b) => ({ value: b.id, label: b.name }))}
            error={errors.blockId?.message}
            {...register('blockId')}
          />
          <Input
            label={t('floor')}
            type="number"
            error={errors.floorNumber?.message}
            {...register('floorNumber')}
          />
          <Input
            label={t('flatNumber')}
            error={errors.flatNumber?.message}
            {...register('flatNumber')}
          />
          <Select
            label={t('flatType')}
            placeholder={t('selectFlatType')}
            options={getFlatTypeOptions((flats ?? []).map((flat) => flat.flatType))}
            error={errors.flatType?.message}
            {...register('flatType')}
          />
          <Input
            label={t('area')}
            type="number"
            error={errors.area?.message}
            {...register('area')}
          />
          <Button type="submit" isLoading={isSubmitting}>
            {commonT('create')}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export default function FlatsPage() {
  const t = useTranslations('flats');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  return (
    <RoleGuard roles={[Role.MANAGER]}>
      <PageHeader title={t('title')} />
      <BlocksSection
        selectedBlockId={selectedBlockId}
        onSelectBlock={setSelectedBlockId}
      />
      <FlatsSection selectedBlockId={selectedBlockId} />
    </RoleGuard>
  );
}
