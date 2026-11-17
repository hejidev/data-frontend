'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiRequest, UserDto } from '@/lib/api';
import { roleHome } from '@/hooks/useAuth';

function Inner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const next = params.get('next');
    apiRequest<{ user: UserDto }>('/me')
    .then(async ({ user }) => {
      try {
        const ref = localStorage.getItem('referral-code');
        if (ref && user.isApproved !== false) {
          await apiRequest('/referrals/claim', { method: 'POST', body: JSON.stringify({ code: ref }) }).catch(() => undefined);
          localStorage.removeItem('referral-code'); // one attempt: invalid/expired codes shouldn't retry forever
        }
      } catch { /* storage unavailable */ }
      const safe = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      router.replace(user.isApproved === false ? '/auth/pending' : (safe ?? roleHome(user)));
    })
      .catch(() => router.replace('/auth/login'));
  }, [params, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      <Loader2 className="animate-spin" size={22} />
    </div>
  );
}

export default function ContinuePage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}