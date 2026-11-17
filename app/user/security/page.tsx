'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { useMe } from '@/hooks/useAuth';
import { useSite } from '@/hooks/useSite';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground">Protect your account and your wallet.</p>
      </div>
      <PinCard />
      <TwoFactorCard />
      <PasswordCard />
      <SessionsCard />
    </div>
  );
}

/* ---------------- Transaction PIN ---------------- */
function PinCard() {
  const qc = useQueryClient();
  const status = useQuery({ queryKey: ['pin-status'], queryFn: api.security.pinStatus });
  const [pin, setPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const hasPin = status.data?.hasPin;

  const save = useMutation({
    mutationFn: () => api.security.setPin({ pin, currentPin: hasPin ? currentPin : undefined }),
    onSuccess: () => {
      toast.success(hasPin ? 'PIN changed' : 'PIN created');
      setPin('');
      setCurrentPin('');
      qc.invalidateQueries({ queryKey: ['pin-status'] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction PIN</CardTitle>
          {status.isLoading ? null : <Badge variant={hasPin ? 'default' : 'secondary'} className={hasPin ? 'bg-teal-600 text-white' : ''}>{hasPin ? 'Active' : 'Not set'}</Badge>}
        </div>
        <CardDescription>Required to confirm every data or airtime purchase.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasPin && (
          <div className="space-y-2">
            <Label>Current PIN</Label>
            <Input type="password" inputMode="numeric" maxLength={6} value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))} />
          </div>
        )}
        <div className="space-y-2">
          <Label>{hasPin ? 'New PIN' : 'Choose a 4–6 digit PIN'}</Label>
          <Input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
        </div>
        <Button
          className="bg-teal-600 text-white hover:bg-teal-700"
          disabled={save.isPending || pin.length < 4 || (!!hasPin && currentPin.length < 4)}
          onClick={() => save.mutate()}
        >
          {hasPin ? 'Change PIN' : 'Create PIN'}
        </Button>
      </CardContent>
    </Card>
  );
}

/* ---------------- Two-factor ---------------- */
function TwoFactorCard() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const { siteName } = useSite();
  const [password, setPassword] = useState('');
  const [setup, setSetup] = useState<{ totpURI: string; backupCodes: string[] } | null>(null);
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ['me'] });

  async function enable() {
    setBusy(true);
    const { data, error } = await authClient.twoFactor.enable({
      password,
      method: 'totp',
      issuer: siteName,
    });
    setBusy(false);
    if (error || !data || !('totpURI' in data)) {
      toast.error(error?.message || 'Could not start setup');
      return;
    }
    setSetup({ totpURI: data.totpURI, backupCodes: data.backupCodes });
    setPassword('');
  }

  async function confirm() {
    setBusy(true);
    const { error } = await authClient.twoFactor.verifyTotp({ code });
    setBusy(false);
    if (error) { toast.error(error.message || 'Invalid code'); return; }
    toast.success('Two-factor authentication is on');
    setCodes(setup?.backupCodes ?? null);
    setSetup(null);
    setCode('');
    refresh();
  }

  async function disable() {
    setBusy(true);
    const { error } = await authClient.twoFactor.disable({ password });
    setBusy(false);
    if (error) { toast.error(error.message || 'Could not disable'); return; }
    toast.success('Two-factor authentication is off');
    setPassword('');
    refresh();
  }

  async function regenerate() {
    const { data, error } = await authClient.twoFactor.generateBackupCodes({ password });
    if (error || !data || !('backupCodes' in data)) {
      toast.error(error?.message || 'Could not generate codes');
      return;
    }
    setCodes(data.backupCodes);
    setPassword('');
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Two-factor authentication</CardTitle>
          <Badge variant={me?.twoFactorEnabled ? 'default' : 'secondary'} className={me?.twoFactorEnabled ? 'bg-teal-600 text-white' : ''}>
            {me?.twoFactorEnabled ? 'On' : 'Off'}
          </Badge>
        </div>
        <CardDescription>Use an authenticator app (Google Authenticator, Authy, 1Password…) for a second login step.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {setup ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Scan this QR code, then enter the 6-digit code to finish.</p>
            <div className="inline-block rounded-xl border bg-white p-3"><QRCodeSVG value={setup.totpURI} size={176} /></div>
            <div className="flex gap-2">
              <Input inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="max-w-40" />
              <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled={busy || code.length !== 6} onClick={confirm}>Verify & enable</Button>
            </div>
          </div>
        ) : codes ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Save these backup codes somewhere safe. Each works once.</p>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-4 font-mono text-sm">{codes.map((c) => <span key={c}>{c}</span>)}</div>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(codes.join('\n')).then(() => toast.success('Copied'))}>Copy codes</Button>
            <Button variant="ghost" onClick={() => setCodes(null)}>I&apos;ve saved them</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Confirm your password</Label>
              <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="max-w-sm" />
            </div>
            {me?.twoFactorEnabled ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled={!password} onClick={regenerate}>New backup codes</Button>
                <Button variant="outline" className="text-destructive" disabled={busy || !password} onClick={disable}>Turn off 2FA</Button>
              </div>
            ) : (
              <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled={busy || !password} onClick={enable}>Set up 2FA</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- Password ---------------- */
function PasswordCard() {
  const [form, setForm] = useState({ current: '', next: '' });
  const [busy, setBusy] = useState(false);

  async function change() {
    if (form.next.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    setBusy(true);
    const { error } = await authClient.changePassword({
      currentPassword: form.current,
      newPassword: form.next,
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (error) { toast.error(error.message || 'Could not change password'); return; }
    toast.success('Password changed. Other devices were signed out.');
    setForm({ current: '', next: '' });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Changing your password signs out your other devices.</CardDescription>
      </CardHeader>
      <CardContent className="max-w-sm space-y-3">
        <div className="space-y-2"><Label>Current password</Label><Input type="password" autoComplete="current-password" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} /></div>
        <div className="space-y-2"><Label>New password</Label><Input type="password" autoComplete="new-password" value={form.next} onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))} /></div>
        <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled={busy || !form.current || !form.next} onClick={change}>Update password</Button>
      </CardContent>
    </Card>
  );
}

/* ---------------- Sessions ---------------- */
function SessionsCard() {
  const qc = useQueryClient();
  const { data: current } = authClient.useSession();
  const sessions = useQuery({
    queryKey: ['auth-sessions'],
    queryFn: async () => {
      const { data, error } = await authClient.listSessions();
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ['auth-sessions'] });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>Devices currently signed in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {sessions.isLoading && <Skeleton className="h-16 rounded-xl" />}
        {(sessions.data ?? []).map((s) => {
          const isCurrent = s.token === current?.session.token;
          return (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{s.userAgent || 'Unknown device'}</div>
                <div className="text-xs text-muted-foreground">{s.ipAddress || 'Unknown IP'} · {new Date(s.createdAt).toLocaleString()}</div>
              </div>
              {isCurrent ? (
                <Badge className="bg-teal-600 text-white">This device</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={async () => { await authClient.revokeSession({ token: s.token }); refresh(); }}>Sign out</Button>
              )}
            </div>
          );
        })}
        {(sessions.data?.length ?? 0) > 1 && (
          <Button variant="outline" className="mt-2" onClick={async () => { await authClient.revokeOtherSessions(); toast.success('Other devices signed out'); refresh(); }}>
            Sign out all other devices
          </Button>
        )}
      </CardContent>
    </Card>
  );
}