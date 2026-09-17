'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useRouter, Link } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/lib/api';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Image from 'next/image';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login, isAuthenticated, isAuthChecked } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthChecked && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthChecked, isAuthenticated, router]);

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.email, values.password);
      toast.success(t('loginSuccess'));
      router.replace('/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="app-shell soft-grid relative flex min-h-screen items-center justify-center px-4 py-8">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_24px_80px_rgba(42,35,86,0.16)] lg:grid-cols-[1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-[#6655c5] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="relative z-10"><div className="mb-12 inline-flex rounded-2xl bg-white px-4 py-2 shadow-lg shadow-[#33245f]/20"><Image src="/rsms-logo.svg" alt="RSMS Resident Hub" width={168} height={45} priority /></div><p className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#dcd6ff]"><Sparkles className="h-4 w-4" /> Community, made simple</p><h2 className="max-w-sm text-4xl font-bold leading-tight">A better rhythm for residential living.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#e7e3ff]">Keep residents connected, requests moving, and everyday operations beautifully organized.</p></div>
          <div className="relative z-10 flex items-center gap-3 text-sm text-[#e7e3ff]"><ShieldCheck className="h-5 w-5 text-[#84cbb1]" /> Secure access for every community role</div>
          <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full border-[35px] border-[#8d80df]/45" />
        </div>
        <div className="p-7 sm:p-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-[#6655c5] transition hover:bg-[#f2efff] hover:text-[#5544af]">
          <ArrowLeft className="h-4 w-4" />
          {t('backToHome')}
        </Link>
        <div className="mb-8 flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
          <Image src="/rsms-logo.svg" alt="RSMS Resident Hub" width={168} height={45} className="mb-2 lg:hidden" priority />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('loginTitle')}</h1>
          <p className="text-sm text-slate-500">{t('loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label={t('emailLabel')}
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label={t('passwordLabel')}
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
            {t('loginButton')}
          </Button>
        </form>

        <div className="mt-5 text-center lg:text-left">
          <Link href="/reset-password" className="text-sm text-blue-600 hover:underline">
            {t('forgotPassword')}
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
