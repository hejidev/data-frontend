'use client';

import { useQuery } from '@tanstack/react-query';
import { Copy, Gift, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { naira } from '@/lib/format';
import { useSite } from '@/hooks/useSite';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReferralsPage() {
  const { siteName } = useSite();
  const q = useQuery({ queryKey: ['referrals'], queryFn: api.referrals.me });
  const d = q.data;

  const link = d ? `${window.location.origin}/auth/signup?ref=${d.code}` : '';
  const message = `Join me on ${siteName} — buy data and airtime in seconds. Sign up with my link: ${link}`;

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: siteName, text: message, url: link }); return; } catch { /* cancelled */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Refer & earn</h1>
        <p className="text-muted-foreground">Invite friends. Earn when they make their first purchase.</p>
      </div>

      {q.isLoading || !d ? (
        <Skeleton className="h-48 rounded-3xl" />
      ) : (
        <>
          {!d.enabled && (
            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              The referral programme isn&apos;t active right now. Your code is saved and will work when it returns.
            </div>
          )}

          <Card className="overflow-hidden">
            <CardContent className="space-y-5 bg-gradient-to-br from-teal-600/10 to-sky-500/10 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white"><Gift size={22} /></span>
                <div>
                  <div className="text-sm text-muted-foreground">You earn</div>
                  <div className="text-2xl font-bold">{naira(d.rewardNaira)} <span className="text-sm font-normal text-muted-foreground">per friend</span></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                You&apos;re paid once your friend signs up with your link and completes their first purchase of {naira(d.minPurchaseNaira)} or more.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded-xl border bg-background px-4 py-2 font-mono text-lg font-bold tracking-widest">{d.code}</code>
                <Button variant="outline" className="rounded-full" onClick={() => navigator.clipboard.writeText(link).then(() => toast.success('Link copied'))}>
                  <Copy size={15} /> Copy link
                </Button>
                <Button className="rounded-full bg-teal-600 text-white hover:bg-teal-700" onClick={share}>
                  <Share2 size={15} /> Share
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Friends joined', String(d.stats.total)],
              ['Rewarded', String(d.stats.rewarded)],
              ['Total earned', naira(d.stats.earned)],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardHeader className="pb-1"><CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold">{value}</CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Your referrals</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {d.referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
                  <span className="font-medium">{r.name}</span>
                  <Badge variant="secondary" className={cn(r.status === 'rewarded' && 'bg-teal-600/10 text-teal-700 dark:text-teal-300')}>
                    {r.status === 'rewarded' ? 'Rewarded' : r.status === 'pending' ? 'Waiting for first purchase' : 'Not eligible'}
                  </Badge>
                </div>
              ))}
              {d.referrals.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nobody yet — share your link to get started.</p>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}