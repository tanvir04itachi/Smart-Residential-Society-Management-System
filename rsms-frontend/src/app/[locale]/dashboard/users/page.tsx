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
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { usersService } from '@/services/users.service';
import { createUserSchema, type CreateUserFormValues } from '@/schemas/user.schema';
import { Role, type User } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

function UsersPageContent() {
  const t = useTranslations('users');
  const commonT = useTranslations('common');
  const roleT = useTranslations('roles');
  const { page, limit, setPage } = usePagination();
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [isModalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, limit, roleFilter],
    queryFn: () =>
      usersService.getAll({
        page,
        limit,
        role: roleFilter || undefined,
      }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({ resolver: zodResolver(createUserSchema) });

  async function onSubmit(values: CreateUserFormValues) {
    try {
      await usersService.create({
        ...values,
        phone: values.phone || undefined,
        password: values.password || undefined,
      });
      toast.success(t('userCreated'));
      reset();
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function toggleActive(user: User) {
    try {
      if (user.isActive) {
        await usersService.deactivate(user.id);
      } else {
        await usersService.activate(user.id);
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const columns: Column<User>[] = [
    { header: commonT('name'), accessor: (u) => u.fullName },
    { header: commonT('email'), accessor: (u) => u.email },
    { header: commonT('phone'), accessor: (u) => u.phone ?? '-' },
    {
      header: commonT('role'),
      accessor: (u) => <Badge tone="blue">{roleT(u.role)}</Badge>,
    },
    {
      header: t('isActive'),
      accessor: (u) => (
        <Badge tone={u.isActive ? 'green' : 'red'}>
          {u.isActive ? commonT('yes') : commonT('no')}
        </Badge>
      ),
    },
    {
      header: commonT('actions'),
      accessor: (u) => (
        <Button variant="outline" size="sm" onClick={() => toggleActive(u)}>
          {u.isActive ? t('deactivate') : t('activate')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('title')}
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('newUser')}
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select
          placeholder={commonT('all')}
          options={Object.values(Role).map((r) => ({ value: r, label: roleT(r) }))}
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as Role | '');
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">{commonT('loading')}</p>
      ) : (
        <>
          <Table
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(u) => u.id}
            emptyMessage={commonT('noData')}
          />
          {data && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={t('newUser')}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label={t('fullName')}
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label={commonT('email')}
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Select
            label={commonT('role')}
            options={Object.values(Role).map((r) => ({ value: r, label: roleT(r) }))}
            error={errors.role?.message}
            {...register('role')}
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
          <Button type="submit" isLoading={isSubmitting}>
            {t('createUser')}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export default function UsersPage() {
  return (
    <RoleGuard roles={[Role.MANAGER]}>
      <UsersPageContent />
    </RoleGuard>
  );
}
