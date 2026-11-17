'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CheckCircle2, Download, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL, ApiError, api } from '@/lib/api';
import { lagosToday, naira } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const presets = [
  { id: 'today', label: 'Today', from: () => lagosToday(0) },
  { id: '7d', label: '7 days', from: () => lagosToday(-6) },
  { id: '30d', label: '30 days', from: () => lagosToday(-29) },
  { id: 'month', label: 'This month', from: () => `${lagosToday(0).slice(0, 8)}01` },
] as const;

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function ReportsPage() {
  const [preset, setPreset] = useState<string>('30d');
  const [from, setFrom] = useState(lagosToday(-29));
  const [to, setTo] = useState(lagosToday(0));

  const summary = useQuery({ queryKey: ['rep-summary', from, to], queryFn: () => api.reports.summary(from, to) });
  const series = useQuery({ queryKey: ['rep-series', from, to], queryFn: () => api.reports.timeseries(from, to) });
  const breakdown = useQuery({ queryKey: ['rep-breakdown', from, to], queryFn: () => api.reports.breakdown(from, to) });

  const check = useMutation({
    mutationFn: api.reports.reconciliation,
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Check failed'),
  });

  function pick(id: string) {
    const p = presets.find((x) => x.id === id)!;
    setPreset(id);
    setFrom(p.from());
    setTo(lagosToday(0));
  }

  async function exportCsv() {
    try {
      const res = await fetch(`${API_URL}/admin/reports/export/orders.csv?from=${from}&to=${to}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Export failed');
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${from}_to_${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export. Please try again.');
    }
  }

  const s = summary.data;
  const kpis: [string, string, string?][] = s
    ? [
        ['Revenue', naira(s.revenue), `${s.orders.delivered} delivered orders`],
        ['Profit', naira(s.profit), `covers ${pct(s.profitCoverage)} of revenue`],
        ['Success rate', pct(s.successRate), `${s.orders.failed} failed or reversed`],
        ['Open orders', String(s.orders.open), 'processing right now'],
        ['Wallet funding', naira(s.fundedNaira), 'paid in by customers'],
        ['Refunded', naira(s.refundedNaira), 'returned to wallets'],
        ['Wallet liability', naira(s.walletLiabilityNaira), 'owed to customers today'],
        ['New users', String(s.newUsers), `referral rewards ${naira(s.referralPaidNaira)}`],
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-(family-name:--font-display) text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Revenue, profit and wallet integrity. Dates are Nigerian time.</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={exportCsv}>
          <Download size={15} /> Export orders (CSV)
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => (
          <button key={p.id} onClick={() => pick(p.id)} className={cn('rounded-full border px-4 py-1.5 text-sm', preset === p.id ? 'border-teal-600 bg-teal-600 text-white' : 'hover:bg-accent')}>
            {p.label}
          </button>
        ))}
        <Input type="date" value={from} max={to} onChange={(e) => { setPreset('custom'); setFrom(e.target.value); }} className="w-40" />
        <span className="text-sm text-muted-foreground">to</span>
        <Input type="date" value={to} min={from} max={lagosToday(0)} onChange={(e) => { setPreset('custom'); setTo(e.target.value); }} className="w-40" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.isLoading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : kpis.map(([label, value, hint]) => (
              <Card key={label}>
                <CardHeader className="pb-1"><CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{value}</div>
                  {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
                </CardContent>
              </Card>
            ))}
      </div>

      {s && s.profitCoverage < 0.99 && (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          Profit only covers {pct(s.profitCoverage)} of revenue: some orders have no recorded cost (older orders, or
          airtime before you set <strong>Airtime cost %</strong> in Settings).
        </p>
      )}

      <Card>
        <CardHeader><CardTitle>Revenue and profit by day</CardTitle></CardHeader>
        <CardContent className="h-72">
          {series.isLoading ? (
            <Skeleton className="h-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series.data?.days ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                <XAxis dataKey="day" tick={{ fill: 'currentColor', fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fill: 'currentColor', fontSize: 11 }} width={60} tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
                <Tooltip
                  formatter={(v) => naira(Number(v))}
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">By network</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(breakdown.data?.byNetwork ?? []).map((r) => (
              <Row key={`${r.provider}${r.type}`} title={`${r.provider} ${r.type}`} orders={r.orders} revenue={r.revenue} profit={r.profit} />
            ))}
            {!breakdown.isLoading && !breakdown.data?.byNetwork.length && <p className="text-sm text-muted-foreground">No delivered orders in this range.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Top data plans</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {(breakdown.data?.topPlans ?? []).map((r) => (
              <Row key={`${r.provider}${r.dataSize}`} title={`${r.provider} ${r.dataSize}`} orders={r.orders} revenue={r.revenue} profit={r.profit} />
            ))}
            {!breakdown.isLoading && !breakdown.data?.topPlans.length && <p className="text-sm text-muted-foreground">No data sales in this range.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck size={18} className="text-teal-600" /> Wallet integrity check</CardTitle>
          <CardDescription>
            Every credit minus every debit in the ledger must equal the total of all wallet balances. Run this before
            payouts and any time something looks off.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled={check.isPending} onClick={() => check.mutate()}>
            {check.isPending ? 'Checking…' : 'Run check'}
          </Button>
          {check.data && (
            <div className="space-y-3">
              <div className={cn('flex items-center gap-2 rounded-xl p-3 text-sm font-medium', check.data.balanced ? 'bg-teal-600/10 text-teal-700 dark:text-teal-300' : 'bg-destructive/10 text-destructive')}>
                {check.data.balanced ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                {check.data.balanced ? 'Balanced: every naira is accounted for.' : `Mismatch of ${naira(check.data.differenceNaira)}. Investigate immediately.`}
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-3">
                <div className="rounded-xl border p-3"><dt className="text-muted-foreground">Ledger net</dt><dd className="font-semibold">{naira(check.data.ledgerNetNaira)}</dd></div>
                <div className="rounded-xl border p-3"><dt className="text-muted-foreground">Wallets total</dt><dd className="font-semibold">{naira(check.data.walletTotalNaira)}</dd></div>
                <div className="rounded-xl border p-3"><dt className="text-muted-foreground">Needs attention</dt><dd className="font-semibold">{check.data.stuckOrders} stuck · {check.data.needsReview} review · {check.data.pendingFunding} unpaid</dd></div>
              </dl>
              {check.data.drift.length > 0 && (
                <div className="space-y-1 text-sm">
                  <div className="font-medium">Wallets that don&apos;t match their ledger:</div>
                  {check.data.drift.map((d) => (
                    <a key={d.userId} href={`/admin/users/${d.userId}`} className="flex justify-between rounded-lg border px-3 py-2 hover:bg-accent">
                      <span>{d.email || d.userId}</span>
                      <span>ledger {naira(d.ledgerNaira)} · wallet {naira(d.walletNaira)}</span>
                    </a>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Checked {new Date(check.data.checkedAt).toLocaleString('en-NG')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ title, orders, revenue, profit }: { title: string; orders: number; revenue: number; profit: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{orders} orders</div>
      </div>
      <div className="text-right">
        <div className="font-semibold">{naira(revenue)}</div>
        <div className="text-xs text-muted-foreground">profit {naira(profit)}</div>
      </div>
    </div>
  );
}