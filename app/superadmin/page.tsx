'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuperAdminDashboard() {
  const dash = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: api.admin.dashboard,
  });
  const pending = useQuery({
    queryKey: ['pending-users'],
    queryFn: api.users.pending,
  });

  const stats = (dash.data as any)?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Superadmin
        </h1>
        <p className="text-slate-600">
          Platform overview, approvals, support and traffic tools.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Users', stats.totalUsers],
          ['Pending approvals', stats.pendingUsers ?? pending.data?.users?.length],
          ['Orders', stats.totalOrders],
          ['Revenue', `₦${Number(stats.revenue || 0).toLocaleString()}`],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{value ?? '—'}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {((dash.data as any)?.recentOrders || []).map((o: any) => (
            <div
              key={o._id}
              className="flex justify-between rounded-xl border px-3 py-2 text-sm"
            >
              <span>
                {o.provider} {o.type} · {o.phoneNumber}
              </span>
              <span className="capitalize">{o.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
