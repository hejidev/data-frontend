'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const FINAL = ['success', 'failed', 'abandoned'];

function CallbackInner() {
  const params = useSearchParams();
  const qc = useQueryClient();
  const reference = params.get('reference') || params.get('trxref');

  const q = useQuery({
    queryKey: ['payment-verify', reference],
    enabled: !!reference,
    retry: 2,
    queryFn: async () => {
      const data = await api.payments.verify(reference!);
      if (data.status === 'success') qc.invalidateQueries({ queryKey: ['wallet'] });
      return data;
    },
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s && FINAL.includes(s)) return false;
      return query.state.dataUpdateCount >= 12 ? false : 4000;
    },
  });

  const status = q.data?.status;
  const done = !!status && FINAL.includes(status);
  const ok = status === 'success';

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      {!reference ? (
        <>
          <XCircle className="text-destructive" size={48} />
          <h1 className="mt-4 text-2xl font-bold">Missing payment reference</h1>
        </>
      ) : !done ? (
        <>
          <Loader2 className="animate-spin text-teal-600" size={48} />
          <h1 className="mt-4 text-2xl font-bold">Confirming your payment…</h1>
          <p className="mt-2 text-muted-foreground">
            {q.isError
              ? 'Still waiting for confirmation. If you were charged, your wallet will be credited automatically.'
              : 'This usually takes a few seconds. Please don’t close this page.'}
          </p>
        </>
      ) : ok ? (
        <>
          <CheckCircle2 className="text-teal-600" size={48} />
          <h1 className="mt-4 text-2xl font-bold">Payment confirmed</h1>
          <p className="mt-2 text-muted-foreground">Your wallet has been credited.</p>
        </>
      ) : (
        <>
          <XCircle className="text-destructive" size={48} />
          <h1 className="mt-4 text-2xl font-bold">Payment not completed</h1>
          <p className="mt-2 text-muted-foreground">You were not charged. You can try again from your wallet.</p>
        </>
      )}
      <Button asChild className="mt-8 rounded-full bg-teal-600 text-white hover:bg-teal-700">
        <Link href="/user/wallet">Go to wallet</Link>
      </Button>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}