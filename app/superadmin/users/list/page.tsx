'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function UsersListPage() {
  const [q, setQ] = useState('');
  const qc = useQueryClient();
  const users = useQuery({
    queryKey: ['users', q],
    queryFn: () => api.users.list(q || undefined),
  });

  const suspend = useMutation({
    mutationFn: (id: string) => api.users.suspend(id),
    onSuccess: () => {
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Users
        </h1>
        <p className="text-slate-600">Search, review, and suspend accounts.</p>
      </div>
      <Input
        placeholder="Search email, name, phone…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-md"
      />
      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(users.data?.users || []).map((u: any) => (
            <div
              key={u._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2"
            >
              <div>
              <Link href={`/admin/users/${u._id}`} className="font-medium hover:underline">{u.full_name}</Link>
                <div className="text-sm text-slate-500">
                  {u.email} · {u.role}
                  {u.isSuspended ? ' · suspended' : ''}
                  {!u.isApproved ? ' · pending' : ''}
                </div>
              </div>
              {u.role !== 'superadmin' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => suspend.mutate(u._id)}
                >
                  {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
