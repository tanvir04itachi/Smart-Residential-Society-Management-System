import { useTranslations } from 'next-intl';
import { ComplaintStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const ORDER: ComplaintStatus[] = [
  ComplaintStatus.PENDING,
  ComplaintStatus.ASSIGNED,
  ComplaintStatus.IN_PROGRESS,
  ComplaintStatus.RESOLVED,
  ComplaintStatus.CLOSED,
];

export function StatusTimeline({ status }: { status: ComplaintStatus }) {
  const t = useTranslations('complaints');
  const isReopened = status === ComplaintStatus.REOPENED;
  const currentIndex = isReopened ? 0 : ORDER.indexOf(status);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {ORDER.map((step, i) => (
          <div key={step} className="flex flex-1 items-center gap-1">
            <div
              className={cn(
                'h-2 flex-1 rounded-full',
                i <= currentIndex ? 'bg-blue-600' : 'bg-slate-200',
              )}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        {ORDER.map((step) => (
          <span key={step}>{t(step)}</span>
        ))}
      </div>
      {isReopened && (
        <div>
          <StatusBadge status={status} />
        </div>
      )}
    </div>
  );
}
