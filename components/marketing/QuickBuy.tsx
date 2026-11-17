'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { naira } from '@/lib/format';
import { NETWORKS, PHONE_RE, type NetworkId } from '@/lib/networks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const AIRTIME_PRESETS = [100, 200, 500, 1000, 2000];

export function QuickBuy() {
  const router = useRouter();
  const [mode, setMode] = useState<'data' | 'airtime'>('data');
  const [network, setNetwork] = useState<NetworkId>('MTN');
  const [planId, setPlanId] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(500);
  const [touched, setTouched] = useState(false);

  const plansQ = useQuery({
    queryKey: ['public-plans'],
    queryFn: () => api.plans.getAll({ type: 'data' }),
  });

  const plans = useMemo(
    () => (plansQ.data?.plans || []).filter((p) => p.provider === network).slice(0, 6),
    [plansQ.data, network]
  );
  const selected = plans.find((p) => p._id === planId);
  const phoneOk = PHONE_RE.test(phone);
  const total = mode === 'data' ? selected?.price : amount;

  function go() {
    setTouched(true);
    if (!phoneOk || (mode === 'data' && !selected)) return;
    const params = new URLSearchParams({ intent: mode, network, phone });
    if (mode === 'data' && selected) params.set('plan', selected._id);
    if (mode === 'airtime') params.set('amount', String(amount));
    router.push(`/auth/signup?${params.toString()}`);
  }

  return (
    <div className="w-full rounded-3xl border bg-card/90 p-5 shadow-2xl shadow-teal-900/10 backdrop-blur sm:p-6">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
        {(['data', 'airtime'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'rounded-full py-2 text-sm font-medium capitalize transition',
              mode === m ? 'bg-teal-600 text-white shadow' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {NETWORKS.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              setNetwork(n.id);
              setPlanId('');
            }}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs font-medium transition',
              network === n.id ? 'border-teal-600 bg-teal-600/10' : 'hover:bg-accent'
            )}
          >
            <span className={cn('h-2.5 w-2.5 rounded-full', n.dot)} />
            {n.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {mode === 'data' ? (
          plansQ.isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              No plans available for {network} right now.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {plans.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setPlanId(p._id)}
                  className={cn(
                    'rounded-xl border px-2 py-2.5 text-center transition',
                    planId === p._id ? 'border-teal-600 bg-teal-600/10' : 'hover:bg-accent'
                  )}
                >
                  <div className="text-sm font-semibold">{p.dataSize}</div>
                  <div className="text-xs text-muted-foreground">{naira(p.price)}</div>
                </button>
              ))}
            </div>
          )
        ) : (
          <div>
            <div className="flex flex-wrap gap-2">
              {AIRTIME_PRESETS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    amount === a ? 'border-teal-600 bg-teal-600/10' : 'hover:bg-accent'
                  )}
                >
                  {naira(a)}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={50}
              max={50000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-3"
              aria-label="Airtime amount"
            />
          </div>
        )}
      </div>

      <Input
        inputMode="tel"
        placeholder="Phone number e.g. 08031234567"
        value={phone}
        onChange={(e) => setPhone(e.target.value.trim())}
        aria-invalid={touched && !phoneOk}
        className="mt-4"
      />
      {touched && !phoneOk && (
        <p className="mt-1.5 text-xs text-destructive">Enter a valid Nigerian phone number.</p>
      )}
      {touched && mode === 'data' && !selected && phoneOk && (
        <p className="mt-1.5 text-xs text-destructive">Pick a plan to continue.</p>
      )}

      <Button onClick={go} className="mt-4 h-11 w-full rounded-full bg-teal-600 text-white hover:bg-teal-700">
        {total ? `Continue · ${naira(total)}` : 'Continue'}
        <ArrowRight size={16} />
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Create a free account to complete your purchase.
      </p>
    </div>
  );
}