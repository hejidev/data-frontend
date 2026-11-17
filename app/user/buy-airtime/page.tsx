'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { naira } from '@/lib/format';
import { NETWORKS, PHONE_RE } from '@/lib/networks';
import { cn } from '@/lib/utils';
import { useIdempotencyKey } from '@/hooks/useIdempotencyKey';
import { usePinPrompt } from '@/components/PinDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PRESETS = [100, 200, 500, 1000, 2000];

export default function BuyAirtimePage() {
  const qc = useQueryClient();
  const router = useRouter();
  const idem = useIdempotencyKey();
  const { ask, dialog } = usePinPrompt();

  const [provider, setProvider] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('100');

  // "Buy again" from a receipt: /user/buy-airtime?network=MTN&phone=0803...&amount=500
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const net = p.get('network');
    if (net && NETWORKS.some((n) => n.id === net)) setProvider(net);
    if (p.get('phone')) setPhoneNumber(p.get('phone')!);
    if (p.get('amount')) setAmount(p.get('amount')!);
  }, []);

  const value = Number(amount);
  const validAmount = Number.isFinite(value) && value >= 50 && value <= 50000;

  const purchase = useMutation({
    mutationFn: (pin: string) =>
      api.orders.airtime({ provider, phoneNumber, amount: value }, idem.get(), pin),
    onSuccess: (data) => {
      idem.rotate();
      const receipt = { label: 'Receipt', onClick: () => router.push(`/user/orders/${data.order._id}`) };
      if (data.success) toast.success(data.message || 'Airtime sent', { action: receipt });
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
        toast.error(err instanceof ApiError ? err.message : 'Network problem. Check Orders before trying again.');
      }
    },
  });

  async function onBuy() {
    if (!PHONE_RE.test(phoneNumber)) {
      toast.error('Enter a valid Nigerian phone number');
      return;
    }
    if (!validAmount) {
      toast.error('Amount must be between ₦50 and ₦50,000');
      return;
    }
    const pin = await ask();
    if (pin) purchase.mutate(pin);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Buy Airtime</h1>
        <p className="text-muted-foreground">Instant airtime top-up from your wallet.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Airtime</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Network</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
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
            <Label>Phone number</Label>
            <Input
              inputMode="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.trim())}
              placeholder="0803…"
            />
          </div>

          <div className="space-y-2">
            <Label>Amount (₦)</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(String(a))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    value === a ? 'border-teal-600 bg-teal-600/10' : 'hover:bg-accent'
                  )}
                >
                  {naira(a)}
                </button>
              ))}
            </div>
            <Input type="number" min={50} max={50000} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <Button
            className="h-11 w-full rounded-full bg-teal-600 text-white hover:bg-teal-700"
            disabled={!phoneNumber || !validAmount || purchase.isPending}
            onClick={onBuy}
          >
            {purchase.isPending ? 'Processing…' : `Buy ${validAmount ? naira(value) : ''} airtime`}
          </Button>
        </CardContent>
      </Card>

      {dialog}
    </div>
  );
}