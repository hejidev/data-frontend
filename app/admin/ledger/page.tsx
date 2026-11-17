'use client';

import Link from 'next/link';
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { naira } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const selectCls = 'h-9 rounded-md border bg-background px-3 text-sm';

export default function LedgerPage() {
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState('');
  const [type, setType] = useState('');
  const [ref, setRef] = useState('');
  const [userId] = useState(() =>
    typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('userId') ?? ''
  );

  const q = useQuery({
    queryKey: ['admin-ledger', { page, kind, type, ref, userId }],
    queryFn: () => api.ops.ledger({ page, kind, type, q: ref, userId }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Ledger</h1>
        <p className="text-muted-foreground">
          Every wallet movement, newest first. Entries are permanent and can never be edited.
          {userId && <> Filtered to one customer.</>}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select className={selectCls} value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }}>
          <option value="">All kinds</option>
          {['funding', 'purchase', 'refund', 'referral', 'adjustment'].map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <select className={selectCls} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">Credit & debit</option>
          <option value="credit">Credits</option>
          <option value="debit">Debits</option>
        </select>
        <Input placeholder="Reference starts with…" value={ref} onChange={(e) => { setRef(e.target.value.trim()); setPage(1); }} className="w-56" />
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Description</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Balance after</th></tr>
            </thead>
            <tbody>
              {q.isLoading && Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={5} className="p-2"><Skeleton className="h-8 rounded-lg" /></td></tr>)}
              {(q.data?.entries ?? []).map((e, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString('en-NG')}</td>
                  <td className="px-4 py-2.5"><Link href={`/admin/users/${e.userId}`} className="hover:underline">{e.email || e.userId}</Link></td>
                  <td className="px-4 py-2.5">
                    <div>{e.description}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{e.reference}</div>
                  </td>
                  <td className={cn('whitespace-nowrap px-4 py-2.5 text-right font-semibold', e.type === 'credit' && 'text-teal-600')}>
                    {e.type === 'credit' ? '+' : '−'}{naira(e.amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right text-muted-foreground">{naira(e.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!q.isLoading && !q.data?.entries.length && <p className="p-10 text-center text-sm text-muted-foreground">No entries match.</p>}
        </CardContent>
      </Card>

      {(q.data?.pages ?? 0) > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" className="rounded-full" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></Button>
          <span className="text-sm text-muted-foreground">Page {page} of {q.data?.pages} · {q.data?.total} entries</span>
          <Button variant="outline" size="icon" className="rounded-full" disabled={page >= (q.data?.pages ?? 1)} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></Button>
        </div>
      )}
    </div>
  );
}