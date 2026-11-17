'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { contentApi } from '@/lib/content-api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const filters = ['all', 'new', 'read', 'resolved'] as const;

export default function AdminMessagesPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<(typeof filters)[number]>('all');
  const messages = useQuery({ queryKey: ['admin-messages', status], queryFn: () => contentApi.contact.list(status) });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => contentApi.contact.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-messages'] }),
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Submissions from the public contact form.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f} onClick={() => setStatus(f)} className={cn('rounded-full border px-4 py-1.5 text-sm capitalize', status === f ? 'border-teal-600 bg-teal-600 text-white' : 'hover:bg-accent')}>{f}</button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Inbox</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {messages.isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          {(messages.data?.messages || []).map((m) => (
            <div key={m._id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{m.subject}</div>
                  <div className="text-xs text-muted-foreground">{m.name} · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a> · {new Date(m.createdAt).toLocaleString()}</div>
                </div>
                <Badge variant={m.status === 'new' ? 'default' : 'secondary'} className={m.status === 'new' ? 'bg-teal-600 text-white' : ''}>{m.status}</Badge>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
              <div className="mt-3 flex gap-2">
                {m.status !== 'read' && <Button size="sm" variant="outline" onClick={() => update.mutate({ id: m._id, status: 'read' })}>Mark read</Button>}
                {m.status !== 'resolved' && <Button size="sm" variant="outline" onClick={() => update.mutate({ id: m._id, status: 'resolved' })}>Resolve</Button>}
              </div>
            </div>
          ))}
          {!messages.isLoading && !messages.data?.messages.length && <p className="text-sm text-muted-foreground">No messages.</p>}
        </CardContent>
      </Card>
    </div>
  );
}