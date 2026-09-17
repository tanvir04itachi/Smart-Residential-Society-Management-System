'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/navigation';
import { authService } from '@/services/auth.service';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
} from '@/schemas/auth.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/lib/api';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

type Step = 'request' | 'reset';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');

  const requestForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onRequestSubmit(values: ForgotPasswordFormValues) {
    try {
      await authService.forgotPassword(values.email);
      toast.success(t('otpSent'));
      setEmail(values.email);
      resetForm.setValue('email', values.email);
      setStep('reset');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function onResetSubmit(values: ResetPasswordFormValues) {
    try {
      await authService.resetPassword({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      toast.success(t('passwordResetSuccess'));
      router.replace('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="app-shell soft-grid relative flex min-h-screen items-center justify-center px-4 py-8">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Image src="/rsms-logo.svg" alt="RSMS Resident Hub" width={168} height={45} priority />
          <h1 className="text-lg font-semibold text-slate-900">
            {t('resetPasswordTitle')}
          </h1>
        </div>

        {step === 'request' ? (
          <form
            onSubmit={requestForm.handleSubmit(onRequestSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label={t('emailLabel')}
              type="email"
              error={requestForm.formState.errors.email?.message}
              {...requestForm.register('email')}
            />
            <Button
              type="submit"
              isLoading={requestForm.formState.isSubmitting}
              className="w-full"
            >
              {t('sendOtp')}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={resetForm.handleSubmit(onResetSubmit)}
            className="flex flex-col gap-4"
          >
            <p className="text-sm text-slate-500">
              {t('otpSent')} <strong>{email}</strong>
            </p>
            <input type="hidden" {...resetForm.register('email')} value={email} />
            <Input
              label={t('otpLabel')}
              maxLength={6}
              error={resetForm.formState.errors.otp?.message}
              {...resetForm.register('otp')}
            />
            <Input
              label={t('newPasswordLabel')}
              type="password"
              error={resetForm.formState.errors.newPassword?.message}
              {...resetForm.register('newPassword')}
            />
            <Input
              label={t('newPasswordLabel')}
              type="password"
              placeholder="Confirm password"
              error={resetForm.formState.errors.confirmPassword?.message}
              {...resetForm.register('confirmPassword')}
            />
            <Button
              type="submit"
              isLoading={resetForm.formState.isSubmitting}
              className="w-full"
            >
              {t('resetPassword')}
            </Button>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
