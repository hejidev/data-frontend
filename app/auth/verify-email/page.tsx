'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

function Inner() {
  const email = useSearchParams().get('email') || '';
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function resend() {
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: `${window.location.origin}/auth/continue`,
    });
    if (error) toast.error(error.message || 'Could not resend');
    else {
      toast.success('Verification email sent');
      setCooldown(60);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <MailCheck className="text-teal-600" size={48} />
      <h1 className="mt-4 font-(family-name:--font-display) text-2xl font-bold">Check your email</h1>
      <p className="mt-2 text-muted-foreground">
        We sent a verification link to <strong>{email || 'your email'}</strong>. Click it to activate your account.
      </p>
      <Button variant="outline" className="mt-6 rounded-full" disabled={cooldown > 0 || !email} onClick={resend}>
        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
      </Button>
      <Link href="/auth/login" className="mt-4 text-sm text-teal-600 hover:underline">Back to login</Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}