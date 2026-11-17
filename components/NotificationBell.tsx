'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { api, NotificationDto } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationBell() {
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const q = useQuery({
    queryKey: ['notifications', 'bell'],
    queryFn: () => api.notifications.list({ page: 1 }),
    refetchInterval: 30_000,
  });
  const unread = q.data?.unreadCount ?? 0;

  const markRead = useMutation({
    mutationFn: (data: { ids?: string[]; all?: boolean }) => api.notifications.markRead(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  function openItem(n: NotificationDto) {
    if (!n.readAt) markRead.mutate({ ids: [n._id] });
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <button className="flex items-center gap-1 text-xs text-teal-600 hover:underline" onClick={() => markRead.mutate({ all: true })}>
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {q.isLoading ? (
            <div className="space-y-2 p-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : (q.data?.notifications.length ?? 0) === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            q.data!.notifications.slice(0, 8).map((n) => (
              <button
                key={n._id}
                onClick={() => openItem(n)}
                className={cn('flex w-full gap-3 border-b px-4 py-3 text-left transition last:border-b-0 hover:bg-accent', !n.readAt && 'bg-teal-600/5')}
              >
                <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.readAt ? 'bg-transparent' : 'bg-teal-600')} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{n.title}</span>
                  <span className="line-clamp-2 block text-xs text-muted-foreground">{n.body}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </span>
              </button>
            ))
          )}
        </div>
        <Link href="/user/notifications" onClick={() => setOpen(false)} className="block border-t px-4 py-2.5 text-center text-xs font-medium text-teal-600 hover:bg-accent">
          View all
        </Link>
      </PopoverContent>
    </Popover>
  );
}