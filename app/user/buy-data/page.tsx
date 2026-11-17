'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { naira } from '@/lib/format';
import { NETWORKS, PHONE_RE } from '@/lib/networks';
import { useIdempotencyKey } from '@/hooks/useIdempotencyKey';
import { usePinPrompt } from '@/components/PinDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BuyDataPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const idem = useIdempotencyKey();
  const { ask, dialog } = usePinPrompt();

  const [provider, setProvider] = useState<string>('MTN');
  const [planId, setPlanId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // "Buy again" from a receipt: /user/buy-data?network=MTN&plan=<id>&phone=0803...
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const net = p.get('network');
    if (net && NETWORKS.some((n) => n.id === net)) setProvider(net);
    if (p.get('plan')) setPlanId(p.get('plan')!);
    if (p.get('phone')) setPhoneNumber(p.get('phone')!);
  }, []);

  const plansQuery = useQuery({
    queryKey: ['plans', provider, 'data'],
    queryFn: () => api.plans.getAll({ provider, type: 'data' }),
  });

  const plans = useMemo(
    () => (plansQuery.data?.plans || []).filter((p) => p.type === 'data'),
    [plansQuery.data]
  );
  const selected = plans.find((p) => p._id === planId);

  const purchase = useMutation({
    mutationFn: (pin: string) => api.orders.purchase({ planId, phoneNumber }, idem.get(), pin),
    onSuccess: (data) => {
      idem.rotate(); // the server answered: the next click is a new purchase
      const receipt = { label: 'Receipt', onClick: () => router.push(`/user/orders/${data.order._id}`) };
      if (data.success) toast.success(data.message || 'Data purchase successful', { action: receipt });
      else if (data.pending) toast.info('Your order is being processed. Please don’t buy again.', { action: receipt });
      else toast.error(data.message || 'Purchase failed — your wallet was refunded', { action: receipt });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['orders-mine'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      const code = err instanceof ApiError ? (err.data as { code?: string })?.code : undefined;
      if (code === 'PIN_NOT_SET') {
        toast.error('Create a transaction PIN first.', {
          action: { label: 'Set PIN', onClick: () => router.push('/user/security') },
        });
      } else if (code === 'INSUFFICIENT_FUNDS') {
        toast.error('Insufficient wallet balance.', {
          action: { label: 'Fund wallet', onClick: () => router.push('/user/wallet') },
        });
      } else {
        // The idempotency key is kept on purpose: a retry of this same attempt can never charge twice.
        toast.error(err instanceof ApiError ? err.message : 'Network problem. Check Orders before trying again.');
      }
    },
  });

  async function onBuy() {
    if (!PHONE_RE.test(phoneNumber)) {
      toast.error('Enter a valid Nigerian phone number');
      return;
    }
    const pin = await ask();
    if (pin) purchase.mutate(pin);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Buy Data</h1>
        <p className="text-muted-foreground">Choose network, plan, and phone number.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Network</Label>
            <Select
              value={provider}
              onValueChange={(v) => {
                setProvider(v);
                setPlanId('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Network" />
              </SelectTrigger>
              <SelectContent>
                {NETWORKS.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Plan</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder={plansQuery.isLoading ? 'Loading…' : 'Select plan'} />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.dataSize} — {naira(p.price)} ({p.duration} {p.durationUnit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Phone number</Label>
            <Input
              inputMode="tel"
              placeholder="0803…"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.trim())}
            />
          </div>

          {selected && (
            <div className="rounded-xl bg-teal-600/10 px-4 py-3 text-sm">
              You will pay <strong>{naira(selected.price)}</strong> from your wallet for {selected.name}.
            </div>
          )}

          <Button
            className="h-11 w-full rounded-full bg-teal-600 text-white hover:bg-teal-700"
            disabled={!planId || !phoneNumber || purchase.isPending}
            onClick={onBuy}
          >
            {purchase.isPending ? 'Processing…' : 'Buy now'}
          </Button>
        </CardContent>
      </Card>

      {dialog}
    </div>
  );
}