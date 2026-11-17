'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { PHONE_RE } from '@/lib/networks';
import { useSite } from '@/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().regex(PHONE_RE, 'Enter a valid Nigerian phone number').or(z.literal('')),
  password: z.string().min(8, 'At least 8 characters').max(128),
});

export default function SignupPage() {
  const router = useRouter();
  const { siteName } = useSite();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const site = useSite(); 
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    try {
      setRef(localStorage.getItem('referral-code'));
    } catch { }
  }, []);


  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }
    if (!agree) {
      toast.error('Please accept the Terms of Service and Privacy Policy to continue');
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await authClient.signUp.email({
      name: parsed.data.full_name,
      email: parsed.data.email,
      password: parsed.data.password,
      phone: parsed.data.phone || undefined,
      callbackURL: `${window.location.origin}/auth/continue`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Signup failed');
      return;
    }
    router.push(`/auth/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
  }

  async function google() {
    await authClient.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/auth/continue` });
  }

  const fields = [
    ['full_name', 'Full name', 'text', 'name'],
    ['email', 'Email', 'email', 'email'],
    ['phone', 'Phone (optional)', 'tel', 'tel'],
    ['password', 'Password', 'password', 'new-password'],
  ] as const;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-(family-name:--font-display) text-3xl font-bold">Create your {siteName} account</h1>
      <p className="mt-2 text-muted-foreground">Free to join. We&apos;ll email you a link to verify your address.</p>

      {ref && site.referralEnabled && (
        <p className="mt-4 rounded-xl bg-teal-600/10 px-4 py-2.5 text-sm">
          You were invited with code <strong>{ref}</strong>.
        </p>
      )}
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
        {fields.map(([key, label, type, auto]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              type={type}
              autoComplete={auto}
              value={form[key]}
              aria-invalid={!!errors[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
            {errors[key]?.[0] && <p className="text-xs text-destructive">{errors[key]![0]}</p>}
          </div>
        ))}
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I agree to the{' '}
            <Link href="/legal/terms" target="_blank" className="text-teal-600 underline">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/legal/privacy" target="_blank" className="text-teal-600 underline">Privacy Policy</Link>.
          </span>
        </label>
        <Button type="submit" className="h-11 w-full rounded-full bg-teal-600 text-white hover:bg-teal-700" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>

      <Button variant="outline" className="mt-3 h-11 w-full rounded-full" onClick={google}>
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-teal-600">Login</Link>
      </p>
    </div>
  );
}