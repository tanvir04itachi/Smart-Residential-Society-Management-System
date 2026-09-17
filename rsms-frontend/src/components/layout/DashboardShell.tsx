'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function DashboardShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthChecked } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthChecked && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthChecked, isAuthenticated, router]);

  if (!isAuthChecked || !isAuthenticated) {
    return <FullPageSpinner />;
  }

  return (
    <div className="app-shell flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="scrollbar-thin flex-1 overflow-y-auto p-4 pb-24 md:p-6 lg:p-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
