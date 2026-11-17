'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TwoFactorPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'totp' | 'backup'>('totp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } =
      mode === 'totp'
        ? await authClient.twoFactor.verifyTotp({ code, trustDevice: true })
        : await authClient.twoFactor.verifyBackupCode({ code, trustDevice: true });
    setLoading(false);
    if (error) return toast.error(error.message || 'Invalid code');
    router.replace('/auth/continue');
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-(family-name:--font-display) text-3xl font-bold">Two-factor verification</h1>
      <p className="mt-2 text-muted-foreground">
        {mode === 'totp' ? 'Enter the 6-digit code from your authenticator app.' : 'Enter one of your saved backup codes.'}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
        {(['totp', 'backup'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setCode(''); }}
            className={cn('rounded-full py-2 text-sm font-medium', mode === m ? 'bg-teal-600 text-white' : 'text-muted-foreground')}
          >
            {m === 'totp' ? 'Authenticator' : 'Backup code'}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <Input
          autoFocus
          inputMode={mode === 'totp' ? 'numeric' : 'text'}
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          className="h-12 text-center text-xl tracking-widest"
        />
        <Button type="submit" disabled={loading || code.length < 6} className="h-11 w-full rounded-full bg-teal-600 text-white hover:bg-teal-700">
          {loading ? 'Verifying…' : 'Verify'}
        </Button>
      </form>
    </div>
  );
}