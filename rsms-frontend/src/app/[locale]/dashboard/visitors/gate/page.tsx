'use client';

import { useTranslations } from 'next-intl';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { GateTerminal } from '@/components/visitors/GateTerminal';
import { Role } from '@/types';

export default function GateTerminalPage() {
  const t = useTranslations('visitors');
  return (
    <RoleGuard roles={[Role.GUARD]}>
      <PageHeader title={t('gateTerminal')} />
      <GateTerminal />
    </RoleGuard>
  );
}
