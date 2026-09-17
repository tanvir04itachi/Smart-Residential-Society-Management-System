'use client';

import { useTranslations } from 'next-intl';
import { Trash2, Paperclip } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Announcement } from '@/types';
import { formatDateTime } from '@/lib/utils';

export function AnnouncementCard({
  announcement,
  canManage,
  onDelete,
}: {
  announcement: Announcement;
  canManage: boolean;
  onDelete?: (id: string) => void;
}) {
  const t = useTranslations('announcements');

  return (
    <Card>
      <CardContent>
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{announcement.title}</h3>
            <p className="text-xs text-slate-400">
              {formatDateTime(announcement.publishedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="blue">{t(announcement.scope)}</Badge>
            {canManage && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(announcement.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-600">{announcement.body}</p>
        {announcement.attachmentUrl && (
          <a
            href={announcement.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <Paperclip className="h-3 w-3" />
            Attachment
          </a>
        )}
      </CardContent>
    </Card>
  );
}
