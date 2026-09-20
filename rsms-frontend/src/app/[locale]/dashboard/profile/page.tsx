'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/users.service';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/schemas/auth.schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDateTime, getAvatarUrl, initials } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProfilePage() {
  const t = useTranslations('profile');
  const commonT = useTranslations('common');
  const usersT = useTranslations('users');
  const roleT = useTranslations('roles');
  const { user, setUser } = useAuth();
  const [isUploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error(t('avatarInvalidType'));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(t('avatarTooLarge'));
      return;
    }

    setUploadingAvatar(true);
    try {
      const updated = await usersService.uploadAvatar(file);
      setUser(updated);
      toast.success(commonT('success'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function onRemoveAvatar() {
    setUploadingAvatar(true);
    try {
      const updated = await usersService.removeAvatar();
      setUser(updated);
      toast.success(commonT('success'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploadingAvatar(false);
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    try {
      await usersService.changeOwnPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success(commonT('success'));
      reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t('title')} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{user?.fullName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center gap-4">
            <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#6655c5] text-lg font-semibold text-white">
              {user?.profilePicture ? (
                <Image
                  src={getAvatarUrl(user.profilePicture)!}
                  alt={user.fullName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : user ? (
                initials(user.fullName)
              ) : (
                <UserIcon className="h-6 w-6" />
              )}
            </span>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_AVATAR_TYPES.join(',')}
                className="hidden"
                onChange={onAvatarSelected}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                isLoading={isUploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
              >
                {t('changeAvatar')}
              </Button>
              {user?.profilePicture && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isUploadingAvatar}
                  onClick={onRemoveAvatar}
                >
                  {t('removeAvatar')}
                </Button>
              )}
            </div>
          </div>
          <p>
            <span className="text-slate-500">{usersT('userId')}:</span>{' '}
            {user?.id ?? '-'}
          </p>
          <p>
            <span className="text-slate-500">{commonT('email')}:</span>{' '}
            {user?.email}
          </p>
          <p>
            <span className="text-slate-500">{commonT('phone')}:</span>{' '}
            {user?.phone ?? '-'}
          </p>
          <p>
            <span className="text-slate-500">{commonT('role')}:</span>{' '}
            {user ? roleT(user.role) : '-'}
          </p>
          <p>
            <span className="text-slate-500">{t('lastLogin')}:</span>{' '}
            {formatDateTime(user?.lastLoginAt)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{usersT('changePassword')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label={usersT('currentPassword')}
              type="password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              label={usersT('newPassword')}
              type="password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label={commonT('confirm')}
              type="password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" isLoading={isSubmitting} className="w-fit">
              {commonT('save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
