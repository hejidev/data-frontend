'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { naira } from '@/lib/format';
import { NETWORKS, type NetworkId } from '@/lib/networks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function PricingView() {
  const [network, setNetwork] = useState<NetworkId>('MTN');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'price' | 'name'>('price');

  const plans = useQuery({
    queryKey: ['public-plans'],
    queryFn: () => api.plans.getAll({ type: 'data' }),
  });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (plans.data?.plans || [])
      .filter((p) => p.provider === network)
      .filter((p) => !term || p.dataSize.toLowerCase().includes(term) || p.name.toLowerCase().includes(term))
      .sort((a, b) => (sort === 'price' ? a.price - b.price : a.dataSize.localeCompare(b.dataSize, undefined, { numeric: true })));
  }, [plans.data, network, q, sort]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300">Pricing</span>
        <h1 className="mt-3 font-(family-name:--font-display) text-4xl font-bold tracking-tight">Simple, transparent prices</h1>
        <p className="mt-3 text-muted-foreground">
          These are live prices from our catalogue. What you see is what you pay — no hidden fees at checkout.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {NETWORKS.map((n) => (
            <button
              key={n.id}
              onClick={() => setNetwork(n.id)}
              className={cn('flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition', network === n.id ? 'border-teal-600 bg-teal-600 text-white' : 'hover:bg-accent')}
            >
              <span className={cn('h-2 w-2 rounded-full', n.dot)} />
              {n.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search e.g. 2GB" className="w-44 rounded-full pl-9" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as 'price' | 'name')} className="h-9 rounded-full border bg-background px-3 text-sm" aria-label="Sort">
            <option value="price">Lowest price</option>
            <option value="name">Data size</option>
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border bg-card">
        <div className="hidden grid-cols-[1.2fr_1fr_1fr_auto] gap-4 border-b bg-muted/40 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
          <span>Plan</span><span>Validity</span><span>Price</span><span />
        </div>
        {plans.isLoading ? (
          <div className="space-y-px p-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : plans.isError ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Couldn&apos;t load prices. Please refresh.</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No plans match.</p>
        ) : (
          rows.map((p) => (
            <div key={p._id} className="grid grid-cols-2 items-center gap-2 border-b px-6 py-4 last:border-b-0 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:gap-4">
              <div>
                <div className="font-semibold">{p.dataSize}</div>
                <div className="text-xs text-muted-foreground">{p.name}</div>
              </div>
              <div className="text-sm text-muted-foreground">{p.duration} {p.durationUnit}</div>
              <div className="font-semibold text-teal-700 dark:text-teal-300">{naira(p.price)}</div>
              <Button asChild size="sm" variant="outline" className="justify-self-end rounded-full">
                <Link href={`/auth/signup?intent=data&network=${p.provider}&plan=${p._id}`}>Buy</Link>
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6">
          <h2 className="font-semibold">Airtime</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Choose any amount from ₦50 to ₦50,000 for any supported network.</p>
        </div>
        <div className="rounded-3xl border bg-card p-6">
          <h2 className="font-semibold">Wallet funding</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Fund with Paystack. Failed orders are refunded to your wallet automatically.</p>
        </div>
      </div>
    </div>
  );
}