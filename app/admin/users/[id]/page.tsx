'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { naira } from '@/lib/format';
import { ORDER_STATUS, toneClass } from '@/lib/order-status';
import { useMe } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const isSuper = me?.role === 'superadmin';
  const [adj, setAdj] = useState({ type: 'credit' as 'credit' | 'debit', amount: '', reason: '' });

  const q = useQuery({ queryKey: ['user-overview', id], queryFn: () => api.ops.userOverview(id) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['user-overview', id] });
  const onError = (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Failed');

  const suspend = useMutation({ mutationFn: () => api.users.suspend(id), onSuccess: () => { toast.success('Updated'); refresh(); }, onError });
  const resetPin = useMutation({ mutationFn: () => api.users.resetPin(id), onSuccess: () => { toast.success('PIN cleared'); refresh(); }, onError });
  const lock = useMutation({ mutationFn: (locked: boolean) => api.adminWallets.lock(id, locked), onSuccess: () => { toast.success('Wallet updated'); refresh(); }, onError });
  const adjust = useMutation({
    mutationFn: () => api.adminWallets.adjust(id, { type: adj.type, amount: Number(adj.amount), reason: adj.reason }),
    onSuccess: (r) => { toast.success(`Done. New balance ${naira(r.balance)}`); setAdj({ type: 'credit', amount: '', reason: '' }); refresh(); qc.invalidateQueries({ queryKey: ['admin-ledger'] }); },
    onError,
  });

  if (q.isLoading) return <div className="space-y-4"><Skeleton className="h-32 rounded-3xl" /><Skeleton className="h-64 rounded-3xl" /></div>;
  if (q.isError || !q.data) return <p className="py-20 text-center text-muted-foreground">User not found.</p>;

  const { user, wallet, orderStats, ledger, orders, referredBy, referralsMade } = q.data;
  const totalSpent = orderStats.filter((s) => s.status === 'success').reduce((n, s) => n + s.amount, 0);

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Users</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-(family-name:--font-display) text-3xl font-bold">{user.full_name}</h1>
          <p className="text-muted-foreground">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
            {user.isSuspended && <Badge variant="destructive">Suspended</Badge>}
            {!user.isApproved && <Badge variant="secondary">Pending approval</Badge>}
            {wallet.isLocked && <Badge variant="destructive">Wallet locked</Badge>}
            {user.twoFactorEnabled && <Badge className="bg-teal-600 text-white">2FA on</Badge>}
            {user.hasPin && <Badge variant="secondary">PIN set</Badge>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Wallet balance</div>
          <div className="text-3xl font-bold text-teal-600">{naira(wallet.balance)}</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ['Total spent', naira(totalSpent)],
          ['Delivered', String(orderStats.find((s) => s.status === 'success')?.count ?? 0)],
          ['Failed', String((orderStats.find((s) => s.status === 'failed')?.count ?? 0) + (orderStats.find((s) => s.status === 'reversed')?.count ?? 0))],
          ['Referred', `${referralsMade}${referredBy ? ` · invited (${referredBy.status})` : ''}`],
        ].map(([label, value]) => (
          <Card key={label}><CardHeader className="pb-1"><CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-xl font-bold">{value}</CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Support actions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {user.role !== 'superadmin' && (
              <Button variant="outline" disabled={suspend.isPending} onClick={() => confirm(user.isSuspended ? 'Unsuspend this user?' : 'Suspend this user and sign them out everywhere?') && suspend.mutate()}>
                {user.isSuspended ? 'Unsuspend' : 'Suspend'}
              </Button>
            )}
            <Button variant="outline" disabled={lock.isPending} onClick={() => confirm(wallet.isLocked ? 'Unlock this wallet?' : 'Lock this wallet? The user will not be able to spend.') && lock.mutate(!wallet.isLocked)}>
              {wallet.isLocked ? 'Unlock wallet' : 'Lock wallet'}
            </Button>
            {isSuper && (
              <Button variant="outline" disabled={resetPin.isPending} onClick={() => confirm('Clear this customer’s transaction PIN so they can set a new one?') && resetPin.mutate()}>
                Reset PIN
              </Button>
            )}
            <Button asChild variant="outline"><Link href={`/admin/ledger?userId=${id}`}>Full ledger</Link></Button>
          </div>

          {isSuper && (
            <div className="rounded-2xl border p-4">
              <div className="mb-3 text-sm font-medium">Adjust wallet (recorded in the ledger and audit log)</div>
              <div className="grid gap-3 sm:grid-cols-[140px_140px_1fr_auto] sm:items-end">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <select value={adj.type} onChange={(e) => setAdj((a) => ({ ...a, type: e.target.value as 'credit' | 'debit' }))} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                    <option value="credit">Credit (add)</option>
                    <option value="debit">Debit (remove)</option>
                  </select>
                </div>
                <div className="space-y-1.5"><Label>Amount (₦)</Label><Input type="number" min={1} value={adj.amount} onChange={(e) => setAdj((a) => ({ ...a, amount: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>Reason (required)</Label><Input value={adj.reason} onChange={(e) => setAdj((a) => ({ ...a, reason: e.target.value }))} placeholder="e.g. Failed funding, ref WALLET_…" /></div>
                <Button
                  className="bg-teal-600 text-white hover:bg-teal-700"
                  disabled={adjust.isPending || Number(adj.amount) <= 0 || adj.reason.trim().length < 5}
                  onClick={() => confirm(`${adj.type === 'credit' ? 'Add' : 'Remove'} ${naira(Number(adj.amount))}?`) && adjust.mutate()}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent orders</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {orders.map((o) => {
              const meta = ORDER_STATUS[o.status] ?? { label: o.status, tone: 'wait' as const };
              return (
                <div key={o._id} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{o.provider} {o.type === 'data' ? o.dataSize : 'airtime'} · {o.phoneNumber}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{o.reference}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{naira(o.amount)}</div>
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px]', toneClass[meta.tone])}>{meta.label}</span>
                  </div>
                </div>
              );
            })}
            {!orders.length && <p className="text-sm text-muted-foreground">No orders.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent wallet activity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ledger.map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate">{l.description}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(l.createdAt).toLocaleString('en-NG')}</div>
                </div>
                <div className={cn('font-semibold', l.type === 'credit' && 'text-teal-600')}>{l.type === 'credit' ? '+' : '−'}{naira(l.amount)}</div>
              </div>
            ))}
            {!ledger.length && <p className="text-sm text-muted-foreground">No activity.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}