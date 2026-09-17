'use client';

import { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';

export function RoleGuard({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-slate-500">
        <ShieldAlert className="h-10 w-10 text-slate-300" />
        <p className="text-sm">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
