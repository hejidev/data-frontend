'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api, OrderDto } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'processing', label: 'Processing' },
  { id: 'review', label: 'Needs review' },
  { id: 'success', label: 'Success' },
  { id: 'failed', label: 'Failed' },
] as const;

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');

  const orders = useQuery({
    queryKey: ['admin-orders', filter],
    queryFn: () =>
      api.orders.all(
        filter === 'review'
          ? { needsReview: true }
          : filter === 'all'
            ? undefined
            : { status: filter }
      ),
    refetchInterval: 15000,
  });

  const requery = useMutation({
    mutationFn: (id: string) => api.vtu.requery(id),
    onSuccess: (r) => {
      toast.message(r.notFound ? 'Provider has no record of this order yet' : `Provider says: ${r.providerStatus} — ${r.outcome}`);
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed'),
  });

  const resolve = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'success' | 'failed' }) =>
      api.orders.updateStatus(id, { status }),
    onSuccess: (data) => {
      toast.success(data.refunded ? 'Order failed — customer refunded' : 'Order marked successful');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed'),
  });

  const open = (o: OrderDto) => o.status === 'processing' || o.status === 'pending';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Orders queue</h1>
        <p className="text-muted-foreground">
          Marking an order failed refunds the customer automatically. Only open orders can be resolved.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm',
              filter === f.id ? 'border-teal-600 bg-teal-600 text-white' : 'hover:bg-accent'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.isLoading &&
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          {(orders.data?.orders || []).map((o) => (
            <div key={o._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
              <div className="min-w-0">
                <div className="font-medium">
                  {o.provider} {o.type} · {o.phoneNumber} · ₦{o.amount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {typeof o.userId === 'object' ? o.userId?.email : o.userId} · {o.reference} ·{' '}
                  {new Date(o.createdAt).toLocaleString()}
                </div>
                {o.providerMessage && <div className="text-xs text-muted-foreground">{o.providerMessage}</div>}
              </div>
              <div className="flex items-center gap-2">
                {o.needsReview && <Badge variant="destructive">Needs review</Badge>}
                <Badge variant="secondary" className="capitalize">{o.status}</Badge>
                {open(o) && (
                  <>
                    <Button size="sm" variant="outline" disabled={requery.isPending} onClick={() => requery.mutate(o._id)}>
                      Check with provider
                    </Button>
                    <Button
                      size="sm"
                      className="bg-teal-600 text-white hover:bg-teal-700"
                      disabled={resolve.isPending}
                      onClick={() =>
                        confirm('Confirm the number really received the value?') &&
                        resolve.mutate({ id: o._id, status: 'success' })
                      }
                    >
                      Mark success
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resolve.isPending}
                      onClick={() =>
                        confirm('Mark failed and REFUND the customer’s wallet?') &&
                        resolve.mutate({ id: o._id, status: 'failed' })
                      }
                    >
                      Fail + refund
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!orders.isLoading && !orders.data?.orders.length && (
            <p className="text-sm text-muted-foreground">No orders.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}