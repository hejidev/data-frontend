'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, naira } from '@/lib/format';
import { ORDER_STATUS, toneClass } from '@/lib/order-status';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'success', label: 'Delivered' },
  { id: 'open', label: 'Processing' },
  { id: 'failed', label: 'Failed' },
] as const;

export default function UserOrdersPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('all');
  const [q, setQ] = useState('');

  const orders = useQuery({
    queryKey: ['orders-mine'],
    queryFn: api.orders.mine,
    refetchInterval: (query) =>
      query.state.data?.orders.some((o) => o.status === 'processing' || o.status === 'pending') ? 5000 : false,
  });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (orders.data?.orders || []).filter((o) => {
      const matchTab =
        tab === 'all' ||
        (tab === 'success' && o.status === 'success') ||
        (tab === 'open' && (o.status === 'processing' || o.status === 'pending')) ||
        (tab === 'failed' && (o.status === 'failed' || o.status === 'reversed'));
      return matchTab && (!term || o.phoneNumber.includes(term) || o.reference.toLowerCase().includes(term));
    });
  }, [orders.data, tab, q]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Your data and airtime purchases. Tap one for its receipt.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn('rounded-full border px-4 py-1.5 text-sm', tab === t.id ? 'border-teal-600 bg-teal-600 text-white' : 'hover:bg-accent')}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Phone or reference" className="rounded-full pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-2 p-3 sm:p-4">
          {orders.isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          {rows.map((o) => {
            const meta = ORDER_STATUS[o.status] ?? { label: o.status, tone: 'wait' as const };
            return (
              <Link key={o._id} href={`/user/orders/${o._id}`} className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition hover:bg-accent">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {o.provider} {o.type === 'data' ? o.dataSize ?? 'data' : 'airtime'} · {o.phoneNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(o.createdAt)} · {o.reference}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">{naira(o.amount)}</div>
                    <span className={cn('inline-block rounded-full px-2 py-0.5 text-[11px] font-medium', toneClass[meta.tone])}>{meta.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </Link>
            );
          })}
          {!orders.isLoading && rows.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              {orders.data?.orders.length ? 'No orders match.' : 'No orders yet.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}