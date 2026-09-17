'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { LogOut, User as UserIcon, Languages } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { getAvatarUrl, initials } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import Image from 'next/image';

export function Topbar() {
  const t = useTranslations('auth');
  const roleT = useTranslations('roles');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function switchLocale() {
    const next = locale === 'en' ? 'bn' : 'en';
    router.replace(pathname, { locale: next });
  }

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="rsms-surface relative z-40 flex h-20 items-center justify-between overflow-visible border-b border-slate-200/80 px-4 backdrop-blur md:px-6 lg:px-8">
      <div className="flex items-center gap-3 md:hidden">
        <Image src="/rsms-logo.svg" alt="RSMS Resident Hub" width={112} height={30} priority />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={switchLocale}
          className="flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-medium text-slate-600 hover:bg-[#f2efff]"
        >
          <Languages className="h-4 w-4" />
          {locale === 'en' ? 'বাংলা' : 'English'}
        </button>

        <NotificationDropdown />

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-[#f2efff]"
          >
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#6655c5] text-xs font-semibold text-white shadow-md shadow-[#6655c5]/20">
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
                <UserIcon className="h-4 w-4" />
              )}
            </span>
            <span className="hidden text-left text-sm md:block">
              <span className="block font-medium text-slate-900">
                {user?.fullName}
              </span>
              <span className="block text-xs text-slate-500">
                {user ? roleT(user.role) : ''}
              </span>
            </span>
          </button>

          {menuOpen && (
            <div className="rsms-surface absolute right-0 z-40 mt-2 w-44 rounded-2xl border border-slate-200 py-1 shadow-lg">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
