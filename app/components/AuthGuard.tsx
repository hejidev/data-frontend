'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useMe } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
  role?: 'admin' | 'superadmin' | 'user';
}

export default function AuthGuard({ children, role }: AuthGuardProps) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useMe();

  const allowed =
    !!user &&
    user.isApproved !== false &&
    (!role ||
      role === 'user' ||
      (role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) ||
      (role === 'superadmin' && user.role === 'superadmin'));

  useEffect(() => {
    if (isLoading) return;
    if (isError || !user) {
      router.replace(`/auth/login?next=${encodeURIComponent(window.location.pathname)}`);
    } else if (user.isApproved === false) {
      router.replace('/auth/pending');
    } else if (!allowed) {
      router.replace('/unauthorized');
    }
  }, [user, isLoading, isError, allowed, router]);

  if (isLoading || !allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }
  return <>{children}</>;
}