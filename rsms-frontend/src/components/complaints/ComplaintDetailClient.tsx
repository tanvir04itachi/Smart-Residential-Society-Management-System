'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { StatusTimeline } from './StatusTimeline';
import { useAuth } from '@/hooks/useAuth';
import { complaintsService } from '@/services/complaints.service';
import { usersService } from '@/services/users.service';
import {
  assignComplaintSchema,
  updateComplaintStatusSchema,
  addNotesSchema,
  type AssignComplaintFormValues,
  type UpdateComplaintStatusFormValues,
  type AddNotesFormValues,
} from '@/schemas/complaint.schema';
import { ComplaintStatus, Role } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

export function ComplaintDetailClient({ id }: { id: string }) {
  const t = useTranslations('complaints');
  const commonT = useTranslations('common');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [assignOpen, setAssignOpen] = useState(false);

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaints', id],
    queryFn: () => complaintsService.getById(id),
  });

  const { data: maintenanceStaff } = useQuery({
    queryKey: ['users', 'maintenance'],
    queryFn: () => usersService.getAll({ role: Role.MAINTENANCE, limit: 100 }),
    enabled: user?.role === Role.MANAGER && assignOpen,
  });

  const assignForm = useForm<AssignComplaintFormValues>({
    resolver: zodResolver(assignComplaintSchema),
  });
  const statusForm = useForm<UpdateComplaintStatusFormValues>({
    resolver: zodResolver(updateComplaintStatusSchema),
  });
  const notesForm = useForm<AddNotesFormValues>({
    resolver: zodResolver(addNotesSchema),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['complaints', id] });
  }

  async function onAssign(values: AssignComplaintFormValues) {
    try {
      await complaintsService.assign(id, values);
      toast.success(commonT('success'));
      setAssignOpen(false);
      invalidate();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function onUpdateStatus(values: UpdateComplaintStatusFormValues) {
    try {
      await complaintsService.updateStatus(id, values);
      toast.success(commonT('success'));
      invalidate();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function onAddNotes(values: AddNotesFormValues) {
    try {
      await complaintsService.addNotes(id, values);
      toast.success(commonT('success'));
      notesForm.reset({ staffNotes: '' });
      invalidate();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function onReopen() {
    try {
      await complaintsService.reopen(id);
      toast.success(commonT('success'));
      invalidate();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  if (isLoading || !complaint) {
    return <p className="text-sm text-slate-500">{commonT('loading')}</p>;
  }

  const isOwnerResident = user?.role === Role.RESIDENT;
  const isAssignedMaintenance =
    user?.role === Role.MAINTENANCE && complaint.assignedToId === user.id;
  const isManager = user?.role === Role.MANAGER;
  const canReopen =
    isOwnerResident &&
    (complaint.status === ComplaintStatus.RESOLVED ||
      complaint.status === ComplaintStatus.CLOSED);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={complaint.title} />

      <Card className="mb-6">
        <CardContent className="space-y-4">
          <StatusTimeline status={complaint.status} />
          <p className="text-sm text-slate-700">{complaint.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-slate-500">{t('category')}</p>
              <p className="font-medium">{t(complaint.category)}</p>
            </div>
            <div>
              <p className="text-slate-500">{t('priority')}</p>
              <p className="font-medium">{t(complaint.priority)}</p>
            </div>
            <div>
              <p className="text-slate-500">{t('assignedTo')}</p>
              <p className="font-medium">{complaint.assignedTo?.fullName ?? '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">{commonT('date')}</p>
              <p className="font-medium">{formatDateTime(complaint.createdAt)}</p>
            </div>
          </div>
          {complaint.staffNotes && (
            <div>
              <p className="text-sm text-slate-500">{t('staffNotes')}</p>
              <p className="text-sm text-slate-700">{complaint.staffNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {isManager && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('assign')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!assignOpen ? (
              <Button variant="outline" className="w-fit" onClick={() => setAssignOpen(true)}>
                {t('assign')}
              </Button>
            ) : (
              <form
                onSubmit={assignForm.handleSubmit(onAssign)}
                className="flex flex-col gap-4 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <Select
                    placeholder={commonT('all')}
                    options={(maintenanceStaff?.data ?? []).map((u) => ({
                      value: u.id,
                      label: u.fullName,
                    }))}
                    error={assignForm.formState.errors.assignedToId?.message}
                    {...assignForm.register('assignedToId')}
                  />
                </div>
                <Button type="submit" isLoading={assignForm.formState.isSubmitting}>
                  {commonT('confirm')}
                </Button>
              </form>
            )}

            <form
              onSubmit={statusForm.handleSubmit(onUpdateStatus)}
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <Select
                  label={t('updateStatus')}
                  placeholder={commonT('all')}
                  options={Object.values(ComplaintStatus).map((s) => ({
                    value: s,
                    label: t(s),
                  }))}
                  error={statusForm.formState.errors.status?.message}
                  {...statusForm.register('status')}
                />
              </div>
              <Button type="submit" isLoading={statusForm.formState.isSubmitting}>
                {commonT('save')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isAssignedMaintenance && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('updateStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form
              onSubmit={statusForm.handleSubmit(onUpdateStatus)}
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <Select
                  placeholder={commonT('all')}
                  options={[
                    ComplaintStatus.IN_PROGRESS,
                    ComplaintStatus.RESOLVED,
                  ].map((s) => ({ value: s, label: t(s) }))}
                  error={statusForm.formState.errors.status?.message}
                  {...statusForm.register('status')}
                />
              </div>
              <Button type="submit" isLoading={statusForm.formState.isSubmitting}>
                {commonT('save')}
              </Button>
            </form>

            <form onSubmit={notesForm.handleSubmit(onAddNotes)} className="flex flex-col gap-2">
              <Textarea
                label={t('addNotes')}
                error={notesForm.formState.errors.staffNotes?.message}
                {...notesForm.register('staffNotes')}
              />
              <Button type="submit" isLoading={notesForm.formState.isSubmitting} className="w-fit">
                {commonT('save')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {canReopen && (
        <Button variant="outline" onClick={onReopen}>
          {t('reopen')}
        </Button>
      )}
    </div>
  );
}
