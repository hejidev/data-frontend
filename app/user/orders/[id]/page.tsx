'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Clock, Copy, LifeBuoy, Printer, RotateCw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api, OrderDto, LedgerLine } from '@/lib/api';
import { naira } from '@/lib/format';
import { ORDER_STATUS, toneClass } from '@/lib/order-status';
import { useSite } from '@/hooks/useSite';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const dt = (iso?: string) => (iso ? new Date(iso).toLocaleString('en-NG') : '—');

function buildTimeline(order: OrderDto, ledger: LedgerLine[]) {
  const debit = ledger.find((l) => l.type === 'debit');
  const refund = ledger.find((l) => l.kind === 'refund');
  const steps: { label: string; at?: string; done: boolean; tone?: 'ok' | 'bad' | 'wait' }[] = [
    { label: 'Order placed', at: order.createdAt, done: true },
    { label: 'Paid from your wallet', at: debit?.createdAt, done: !!debit },
  ];
  if (order.status === 'success') {
    steps.push({ label: 'Delivered', at: order.resolvedAt ?? order.updatedAt, done: true, tone: 'ok' });
  } else if (order.status === 'failed' || order.status === 'reversed') {
    steps.push({ label: order.status === 'reversed' ? 'Reversed by provider' : 'Could not be delivered', at: order.resolvedAt, done: true, tone: 'bad' });
    steps.push({ label: 'Refunded to your wallet', at: refund?.createdAt, done: !!refund, tone: 'ok' });
  } else {
    steps.push({ label: 'Waiting for provider confirmation', done: false, tone: 'wait' });
  }
  return steps;
}

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { siteName } = useSite();

  const q = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.orders.get(id),
    refetchInterval: (query) => {
      const s = query.state.data?.order.status;
      return s === 'processing' || s === 'pending' ? 5000 : false;
    },
  });

  if (q.isLoading) {
    return <div className="mx-auto max-w-2xl space-y-4"><Skeleton className="h-40 rounded-3xl" /><Skeleton className="h-64 rounded-3xl" /></div>;
  }
  if (q.isError || !q.data) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-xl font-bold">Order not found</h1>
        <Button asChild variant="outline" className="mt-4 rounded-full"><Link href="/user/orders">Back to orders</Link></Button>
      </div>
    );
  }

  const { order: o, ledger } = q.data;
  const meta = ORDER_STATUS[o.status] ?? { label: o.status, tone: 'wait' as const };
  const open = o.status === 'processing' || o.status === 'pending';
  const Icon = meta.tone === 'ok' ? CheckCircle2 : meta.tone === 'bad' ? XCircle : Clock;
  const service = o.type === 'data' ? `${o.provider} data ${o.dataSize ?? ''}`.trim() : `${o.provider} airtime`;

  const buyAgain =
    o.type === 'data'
      ? `/user/buy-data?network=${o.provider}&plan=${o.planId ?? ''}&phone=${o.phoneNumber}`
      : `/user/buy-airtime?network=${o.provider}&phone=${o.phoneNumber}&amount=${o.amount}`;

  const rows: [string, string][] = [
    ['Service', service],
    ['Recipient', o.phoneNumber],
    ['Amount', naira(o.amount)],
    ['Placed', dt(o.createdAt)],
    ['Completed', open ? 'Pending' : dt(o.resolvedAt ?? o.updatedAt)],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/user/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden">
        <ArrowLeft size={14} /> All orders
      </Link>

      <Card>
        <CardContent className="flex flex-col items-center p-8 text-center">
          <span className={cn('flex h-14 w-14 items-center justify-center rounded-full', toneClass[meta.tone])}><Icon size={28} /></span>
          <h1 className="mt-4 font-(family-name:--font-display) text-2xl font-bold">{meta.label}</h1>
          <div className="mt-1 text-3xl font-bold">{naira(o.amount)}</div>
          <p className="mt-1 text-sm text-muted-foreground">{service} → {o.phoneNumber}</p>
          {open && (
            <p className="mt-4 max-w-sm rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              This order is still being confirmed. <strong>Please don&apos;t buy again</strong> — we&apos;ll complete it or
              refund your wallet automatically.
            </p>
          )}
          {!open && o.status !== 'success' && o.providerMessage && (
            <p className="mt-3 text-sm text-muted-foreground">{o.providerMessage}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="relative space-y-5 border-l pl-6">
            {buildTimeline(o, ledger).map((s, i) => (
              <li key={i} className="relative">
                <span className={cn('absolute -left-[31px] top-0.5 h-3 w-3 rounded-full border-2 border-background', s.done ? (s.tone === 'bad' ? 'bg-destructive' : 'bg-teal-600') : 'animate-pulse bg-amber-500')} />
                <div className="text-sm font-medium">{s.label}</div>
                {s.at && <div className="text-xs text-muted-foreground">{dt(s.at)}</div>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent>
          <dl className="divide-y text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
            ))}
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">Reference</dt>
              <dd className="flex items-center gap-2 font-mono text-xs">
                {o.reference}
                <button className="print:hidden" aria-label="Copy reference" onClick={() => navigator.clipboard.writeText(o.reference).then(() => toast.success('Reference copied'))}>
                  <Copy size={14} />
                </button>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {ledger.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Wallet activity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ledger.map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm">
                <div>
                  <div className="font-medium">{l.description}</div>
                  <div className="text-xs text-muted-foreground">{dt(l.createdAt)}</div>
                </div>
                <div className={cn('font-semibold', l.type === 'credit' ? 'text-teal-600' : '')}>
                  {l.type === 'credit' ? '+' : '−'}{naira(l.amount)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button asChild className="rounded-full bg-teal-600 text-white hover:bg-teal-700" disabled={open}>
          <Link href={buyAgain}><RotateCw size={15} /> Buy again</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/user/support?order=${o.reference}`}><LifeBuoy size={15} /> Report a problem</Link>
        </Button>
        <Button variant="outline" className="rounded-full" onClick={() => window.print()}><Printer size={15} /> Print</Button>
      </div>
      <p className="hidden text-center text-xs text-muted-foreground print:block">Receipt from {siteName}</p>
    </div>
  );
}