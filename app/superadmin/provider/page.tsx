'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { naira } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProviderPage() {
  const qc = useQueryClient();
  const [markup, setMarkup] = useState(8);
  const status = useQuery({ queryKey: ['vtu-status'], queryFn: api.vtu.status, refetchInterval: 30000 });

  const sync = useMutation({
    mutationFn: () => api.vtu.sync(markup),
    onSuccess: (r) => {
      toast.success(`Synced: ${r.created} new (inactive), ${r.updated} updated, ${r.deactivated} switched off`);
      qc.invalidateQueries({ queryKey: ['vtu-status'] });
      qc.invalidateQueries({ queryKey: ['admin-plans'] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Sync failed'),
  });

  const s = status.data;
  const sandboxLive = s && s.mode === 'live' && s.environment === 'sandbox';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">VTU provider</h1>
        <p className="text-muted-foreground">Health, balance and plan sync for your VTpass connection.</p>
      </div>

      {sandboxLive && s?.isProduction && (
        <div className="flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 shrink-0 text-destructive" size={18} />
          <p>
            <strong>Sandbox keys are active in production.</strong> Orders will look successful but nothing is
            delivered to real phones. Set <code>VTPASS_ENV=live</code> with your live keys.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {status.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Mode</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold capitalize">{s?.provider}</div>
                <Badge variant="secondary">{s?.provider === 'vtpass' ? s.environment : 'no real delivery'}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">VTpass balance</CardTitle></CardHeader>
              <CardContent>
                {s?.balance != null ? (
                  <div className={`text-2xl font-bold ${s.balance < s.lowBalanceThreshold ? 'text-destructive' : ''}`}>{naira(s.balance)}</div>
                ) : (
                  <div className="text-sm text-muted-foreground">{s?.balanceError ?? 'Only shown in live mode'}</div>
                )}
                <div className="mt-1 text-xs text-muted-foreground">Alert below {naira(s?.lowBalanceThreshold ?? 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Orders</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s?.processing ?? 0}</div>
                <div className="text-xs text-muted-foreground">processing · {s?.needsReview ?? 0} need review</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Plans</CardTitle></CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${s?.plansBelowCost ? 'text-destructive' : ''}`}>{s?.plansBelowCost ?? 0}</div>
                <div className="text-xs text-muted-foreground">below cost · {s?.inactiveSynced ?? 0} awaiting review</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            ['API keys configured on the server', s?.configured],
            ['Webhook secret configured', s?.webhookConfigured],
            ['Balance readable (keys + IP whitelist OK)', s?.balance != null || s?.provider === 'mock'],
          ].map(([label, ok]) => (
            <div key={String(label)} className="flex items-center gap-2">
              {ok ? <CheckCircle2 size={16} className="text-teal-600" /> : <AlertTriangle size={16} className="text-amber-500" />}
              {label}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync data plans from VTpass</CardTitle>
          <CardDescription>
            New plans are created <strong>inactive</strong> at cost + markup so you can review them. Existing plans only
            get their cost refreshed, and are switched off if the cost rises above your price.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label>Markup on cost (%)</Label>
            <Input type="number" min={0} max={100} value={markup} onChange={(e) => setMarkup(Number(e.target.value))} className="w-32" />
          </div>
          <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled={sync.isPending || !s?.configured} onClick={() => sync.mutate()}>
            {sync.isPending ? 'Syncing…' : 'Sync plans'}
          </Button>
          <Button asChild variant="outline"><Link href="/admin/plans">Review plans</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}