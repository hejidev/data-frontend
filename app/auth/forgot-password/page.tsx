'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/auth/reset-password` });
    setLoading(false);
    setSent(true); // always the same message: never reveal whether an email is registered
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-(family-name:--font-display) text-3xl font-bold">Forgot password?</h1>
      {sent ? (
        <p className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          If an account exists for <strong>{email}</strong>, a reset link is on its way. It expires in 1 hour.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="h-11 w-full rounded-full bg-teal-600 text-white hover:bg-teal-700">
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
      <Link href="/auth/login" className="mt-6 text-center text-sm text-teal-600 hover:underline">Back to login</Link>
    </div>
  );
}