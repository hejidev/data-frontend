'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, CheckCheck } from 'lucide-react';
import { api, NotificationDto } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const q = useQuery({
    queryKey: ['notifications', 'page', page],
    queryFn: () => api.notifications.list({ page }),
    placeholderData: keepPreviousData,
  });
  const markRead = useMutation({
    mutationFn: (data: { ids?: string[]; all?: boolean }) => api.notifications.markRead(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  function open(n: NotificationDto) {
    if (!n.readAt) markRead.mutate({ ids: [n._id] });
    if (n.link) router.push(n.link);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-(family-name:--font-display) text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Order updates, refunds and rewards.</p>
        </div>
        {(q.data?.unreadCount ?? 0) > 0 && (
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => markRead.mutate({ all: true })}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {q.isLoading && <div className="space-y-2 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>}
          {q.data?.notifications.map((n) => (
            <button key={n._id} onClick={() => open(n)} className={cn('flex w-full gap-3 border-b px-5 py-4 text-left transition last:border-b-0 hover:bg-accent', !n.readAt && 'bg-teal-600/5')}>
              <span className={cn('mt-2 h-2 w-2 shrink-0 rounded-full', n.readAt ? 'bg-transparent' : 'bg-teal-600')} />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{n.title}</span>
                <span className="block text-sm text-muted-foreground">{n.body}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
              </span>
            </button>
          ))}
          {!q.isLoading && !q.data?.notifications.length && <p className="p-10 text-center text-sm text-muted-foreground">No notifications yet.</p>}
        </CardContent>
      </Card>

      {(q.data?.pages ?? 0) > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" className="rounded-full" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></Button>
          <span className="text-sm text-muted-foreground">Page {page} of {q.data?.pages}</span>
          <Button variant="outline" size="icon" className="rounded-full" disabled={page >= (q.data?.pages ?? 1)} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></Button>
        </div>
      )}
    </div>
  );
}