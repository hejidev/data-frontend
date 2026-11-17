'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WalletPage() {
  const qc = useQueryClient();
  const [amount, setAmount] = useState('1000');
  const wallet = useQuery({
    queryKey: ['wallet'],
    queryFn: api.wallet.balance,
  });
  const txs = useQuery({
    queryKey: ['wallet-txs'],
    queryFn: api.wallet.transactions,
  });

  const fund = useMutation({
    mutationFn: () => api.wallet.fund(Number(amount)),
    onSuccess: (data) => {
      toast.success('Redirecting to Paystack…');
      window.location.href = data.authorizationUrl;
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Funding failed'),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Wallet
        </h1>
        <p className="text-slate-600">Fund with Paystack and track your ledger.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-[#0f766e]">
            ₦{(wallet.data?.balance || 0).toLocaleString()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fund wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                min={100}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-[#0f766e] hover:bg-[#0d9488]"
              disabled={fund.isPending}
              onClick={() => fund.mutate()}
            >
              {fund.isPending ? 'Starting…' : 'Pay with Paystack'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(txs.data?.transactions || []).map((t) => (
            <div
              key={t._id}
              className="flex justify-between rounded-xl border px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium capitalize">
                  {t.type.replace('_', ' ')}
                </div>
                <div className="text-slate-500">{t.reference}</div>
              </div>
              <div className="text-right">
                <div>₦{t.amount.toLocaleString()}</div>
                <div className="capitalize text-slate-500">{t.status}</div>
              </div>
            </div>
          ))}
          {!txs.isLoading && (txs.data?.transactions?.length || 0) === 0 && (
            <p className="text-sm text-slate-500">No transactions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
