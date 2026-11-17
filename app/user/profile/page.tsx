'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { useMe } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const qc = useQueryClient();
  const { data: me, isLoading } = useMe();
  const [form, setForm] = useState({ full_name: '', phone: '', emailNotifications: true });

  useEffect(() => {
    if (me) setForm({ full_name: me.full_name ?? '', phone: me.phone ?? '', emailNotifications: me.emailNotifications !== false });
  }, [me]);

  const save = useMutation({
    mutationFn: () => api.me.update(form),
    onSuccess: () => { toast.success('Profile updated'); qc.invalidateQueries({ queryKey: ['me'] }); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Your account details and preferences.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : (
            <>
              <div className="space-y-2"><Label>Email</Label><Input value={me?.email ?? ''} disabled /><p className="text-xs text-muted-foreground">Contact support to change your email.</p></div>
              <div className="space-y-2"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
              <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled={save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
          <CardDescription>Refunds, failed orders, wallet funding and referral rewards. Security emails are always sent.</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={form.emailNotifications} onChange={(e) => { setForm((f) => ({ ...f, emailNotifications: e.target.checked })); api.me.update({ emailNotifications: e.target.checked }).then(() => qc.invalidateQueries({ queryKey: ['me'] })); }} />
            Email me about my orders and wallet
          </label>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Password, two-factor authentication and your transaction PIN are under{' '}
        <Link href="/user/security" className="text-teal-600 underline">Security</Link>.
      </p>
    </div>
  );
}