'use client';

import Link from 'next/link';
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const groups = ['', 'order', 'wallet', 'user', 'plan', 'vtu', 'settings', 'legal', 'report'];

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const q = useQuery({
    queryKey: ['audit', page, action],
    queryFn: () => api.ops.audit({ page, action }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Audit log</h1>
        <p className="text-muted-foreground">Who did what, and when. Entries cannot be edited or deleted.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <button key={g || 'all'} onClick={() => { setAction(g); setPage(1); }} className={`rounded-full border px-4 py-1.5 text-sm capitalize ${action === g ? 'border-teal-600 bg-teal-600 text-white' : 'hover:bg-accent'}`}>
            {g || 'All'}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {q.isLoading && <div className="space-y-2 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>}
          {(q.data?.rows ?? []).map((r) => (
            <div key={r._id} className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-3.5 text-sm last:border-b-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-[11px]">{r.action}</Badge>
                  <span className="font-medium">{r.summary}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  by {r.actorEmail ?? 'system'} ({r.actorRole ?? '—'}){r.ip ? ` · ${r.ip}` : ''}
                  {r.targetType === 'user' && r.targetId && <> · <Link className="underline" href={`/admin/users/${r.targetId}`}>view user</Link></>}
                </div>
              </div>
              <div className="whitespace-nowrap text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString('en-NG')}</div>
            </div>
          ))}
          {!q.isLoading && !q.data?.rows.length && <p className="p-10 text-center text-sm text-muted-foreground">Nothing recorded yet.</p>}
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