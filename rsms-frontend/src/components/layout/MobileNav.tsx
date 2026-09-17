'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { NAV_ITEMS } from './nav-config';
import { cn } from '@/lib/utils';
import { ChevronUp, MoreHorizontal } from 'lucide-react';

export function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const items = NAV_ITEMS.filter((item) => !user || item.roles.includes(user.role));
  const primaryItems = items.slice(0, 4);
  const moreItems = items.slice(4);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const navLinkClass = (active: boolean) =>
    cn(
      'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors',
      active ? 'bg-[#eeeaff] text-[#5949b6]' : 'text-slate-400',
    );

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_12px_35px_rgba(42,35,86,0.16)] backdrop-blur md:hidden"
    >
      {moreOpen && moreItems.length > 0 && (
        <div className="rsms-surface absolute bottom-[calc(100%+0.75rem)] left-0 right-0 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 p-2 shadow-[0_12px_35px_rgba(42,35,86,0.18)] sm:grid-cols-3">
          {moreItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  'flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-[#eeeaff] text-[#5949b6]'
                    : 'text-slate-600 hover:bg-[#f7f5ff] hover:text-slate-900',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-around">
        {primaryItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.key} href={item.href} className={navLinkClass(active)}>
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate">{t(item.key)}</span>
            </Link>
          );
        })}

        {moreItems.length > 0 && (
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-label={t('more')}
            onClick={() => setMoreOpen((open) => !open)}
            className={navLinkClass(moreOpen || moreItems.some((item) => isActive(item.href)))}
          >
            {moreOpen ? <ChevronUp className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
            <span>{t('more')}</span>
          </button>
        )}
      </div>
    </nav>
  );
}
