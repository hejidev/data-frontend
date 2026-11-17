'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, api, PendingUserDto } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function Row({ u, children }: { u: PendingUserDto; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
      <div>
        <div className="font-semibold">{u.full_name}</div>
        <div className="text-sm text-muted-foreground">{u.email}{u.phone ? ` · ${u.phone}` : ''}</div>
        {u.createdAt && <div className="text-xs text-muted-foreground">Signed up {timeAgo(u.createdAt)}</div>}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export default function ApprovalsPage() {
  const qc = useQueryClient();
  const unverified = useQuery({ queryKey: ['unverified-users'], queryFn: api.users.unverified, refetchInterval: 15000 });
  const pending = useQuery({ queryKey: ['pending-users'], queryFn: api.users.pending, refetchInterval: 15000 });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['unverified-users'] });
    qc.invalidateQueries({ queryKey: ['pending-users'] });
    qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
  };
  const onError = (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Failed');

  const verify = useMutation({ mutationFn: (id: string) => api.users.verifyEmail(id), onSuccess: () => { toast.success('Email marked as verified. The user can log in now.'); refresh(); }, onError });
  const approve = useMutation({ mutationFn: (id: string) => api.users.approve(id), onSuccess: () => { toast.success('User approved'); refresh(); }, onError });
  const remove = useMutation({ mutationFn: (id: string) => api.users.reject(id), onSuccess: () => { toast.success('Signup removed'); refresh(); }, onError });

  const idOf = (u: PendingUserDto) => String(u.id || u._id);
  const unverifiedUsers = unverified.data?.users ?? [];
  const pendingUsers = pending.data?.users ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Signups</h1>
        <p className="text-muted-foreground">Verify emails by hand and approve new accounts.</p>
      </div>

      {unverifiedUsers.length > 0 && (
        <div className="flex gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
          <p>
            Verification emails can&apos;t reach customers until you verify a sending domain in Resend.
            Until then, confirm people here after checking they are real. Don&apos;t confirm an email you can&apos;t trust.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Awaiting email verification</CardTitle>
          <CardDescription>They signed up but haven&apos;t confirmed their email, so they can&apos;t log in yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {unverified.isLoading && <Skeleton className="h-20 rounded-xl" />}
          {unverifiedUsers.map((u) => (
            <Row key={idOf(u)} u={u}>
              <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" disabled={verify.isPending} onClick={() => confirm(`Mark ${u.email} as verified?`) && verify.mutate(idOf(u))}>
                Mark email verified
              </Button>
              <Button size="sm" variant="outline" disabled={remove.isPending} onClick={() => confirm(`Remove the signup for ${u.email}?`) && remove.mutate(idOf(u))}>
                Remove
              </Button>
            </Row>
          ))}
          {!unverified.isLoading && unverifiedUsers.length === 0 && <p className="text-sm text-muted-foreground">Nobody is waiting.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Awaiting approval</CardTitle>
          <CardDescription>Only used when manual approval is switched on (<code>REQUIRE_MANUAL_APPROVAL=true</code>).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.isLoading && <Skeleton className="h-20 rounded-xl" />}
          {pendingUsers.map((u) => (
            <Row key={idOf(u)} u={u}>
              <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" disabled={approve.isPending} onClick={() => approve.mutate(idOf(u))}>Approve</Button>
              <Button size="sm" variant="outline" disabled={remove.isPending} onClick={() => confirm(`Reject ${u.email}?`) && remove.mutate(idOf(u))}>Reject</Button>
            </Row>
          ))}
          {!pending.isLoading && pendingUsers.length === 0 && <p className="text-sm text-muted-foreground">No pending users.</p>}
        </CardContent>
      </Card>
    </div>
  );
}