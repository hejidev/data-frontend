'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { useSite } from '@/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const safeNext = (n: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : null);

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { siteName } = useSite();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);

  const next = safeNext(params.get('next'));
  const continueUrl = `/auth/continue${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNeedsVerify(false);
    const { data, error } = await authClient.signIn.email({ email, password });
    setLoading(false);

    if (error) {
      if (error.status === 403 && /verif/i.test(error.message ?? '')) setNeedsVerify(true);
      else toast.error(error.message || 'Login failed');
      return;
    }
    // When 2FA is on, the plugin has already redirected to /auth/two-factor.
    if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) return;
    router.replace(continueUrl);
  }

  async function resend() {
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: `${window.location.origin}/auth/continue`,
    });
    if (error) toast.error(error.message || 'Could not resend');
    else toast.success('Verification email sent');
  }

  async function google() {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}${continueUrl}`,
    });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-(family-name:--font-display) text-3xl font-bold">Login to {siteName}</h1>
      <p className="mt-2 text-muted-foreground">Welcome back — buy data and airtime from your wallet.</p>

      {needsVerify && (
        <div className="mt-4 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Please verify your email first. We just sent you a new link.{' '}
          <button className="font-semibold underline" onClick={resend}>Resend</button>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs text-teal-600 hover:underline">Forgot password?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="h-11 w-full rounded-full bg-teal-600 text-white hover:bg-teal-700" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </Button>
      </form>

      <Button variant="outline" className="mt-3 h-11 w-full rounded-full" onClick={google}>
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link href="/auth/signup" className="font-semibold text-teal-600">Sign up</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}