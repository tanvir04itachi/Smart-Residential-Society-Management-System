import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'slate' | 'green' | 'red' | 'yellow' | 'blue' | 'purple';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  slate: 'bg-slate-100 text-slate-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ className, tone = 'slate', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'rsms-badge badge inline-flex h-auto items-center rounded-full border-0 px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

const STATUS_TONE_MAP: Record<string, BadgeTone> = {
  PENDING: 'yellow',
  ASSIGNED: 'blue',
  IN_PROGRESS: 'blue',
  RESOLVED: 'green',
  CLOSED: 'slate',
  REOPENED: 'red',
  APPROVED: 'green',
  DENIED: 'red',
  EXITED: 'slate',
  PAID: 'green',
  OVERDUE: 'red',
  PARTIAL: 'yellow',
  CONFIRMED: 'green',
  CANCELLED: 'red',
  COMPLETED: 'slate',
  SUSPICIOUS: 'red',
  DELIVERY: 'purple',
  REGULAR: 'blue',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE_MAP[status] ?? 'slate'}>{status}</Badge>;
}
