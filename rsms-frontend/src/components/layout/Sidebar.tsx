'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { NAV_ITEMS } from './nav-config';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { user } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !user || item.roles.includes(user.role),
  );

  return (
    <aside className="rsms-surface hidden w-64 shrink-0 flex-col border-r border-slate-200/80 backdrop-blur md:flex">
      <div className="flex h-20 items-center border-b border-slate-100 px-6">
        <Image src="/rsms-logo.svg" alt="RSMS Resident Hub" width={168} height={45} priority />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#eeeaff] text-[#5949b6] shadow-sm'
                  : 'text-slate-500 hover:bg-[#f7f5ff] hover:text-slate-900',
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
