'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMe } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserDashboardPage() {
  const { data: user } = useMe();
  const wallet = useQuery({
    queryKey: ['wallet'],
    queryFn: api.wallet.balance,
  });
  const orders = useQuery({
    queryKey: ['orders-mine'],
    queryFn: api.orders.mine,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#041628]">
          Welcome{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-slate-600">Buy data or airtime from your wallet.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wallet balance</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-[#0f766e]">
            {wallet.isLoading
              ? '…'
              : `₦${(wallet.data?.balance || 0).toLocaleString()}`}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {orders.data?.orders?.length ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link
              href="/user/buy-data"
              className="rounded-full bg-[#0f766e] px-3 py-1.5 text-sm text-white"
            >
              Buy data
            </Link>
            <Link
              href="/user/buy-airtime"
              className="rounded-full border px-3 py-1.5 text-sm"
            >
              Buy airtime
            </Link>
            <Link
              href="/user/wallet"
              className="rounded-full border px-3 py-1.5 text-sm"
            >
              Fund wallet
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(orders.data?.orders || []).slice(0, 5).map((o) => (
            <div
              key={o._id}
              className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium">
                  {o.provider} {o.type} · {o.phoneNumber}
                </div>
                <div className="text-slate-500">{o.reference}</div>
              </div>
              <div className="text-right">
                <div>₦{o.amount.toLocaleString()}</div>
                <div className="capitalize text-slate-500">{o.status}</div>
              </div>
            </div>
          ))}
          {!orders.isLoading && (orders.data?.orders?.length || 0) === 0 && (
            <p className="text-sm text-slate-500">No orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
