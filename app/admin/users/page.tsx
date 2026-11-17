'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminUsersPage() {
  const users = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Users
        </h1>
        <p className="text-slate-600">Customer accounts overview.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(users.data?.users || []).map((u: any) => (
            <div key={u._id} className="rounded-xl border px-3 py-2 text-sm">
              <Link href={`/admin/users/${u._id}`} className="font-medium hover:underline">{u.full_name}</Link>
              <div className="text-slate-500">
                {u.email} · {u.role} ·{' '}
                {u.isApproved ? 'approved' : 'pending'}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
