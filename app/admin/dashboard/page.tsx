'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardPage() {
  const dash = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: api.admin.dashboard,
  });
  const stats = (dash.data as any)?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Admin dashboard
        </h1>
        <p className="text-slate-600">Orders, users, and sales at a glance.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Users', stats.totalUsers],
          ['Pending', stats.pendingUsers],
          ['Successful orders', stats.successOrders],
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
    </div>
  );
}
