'use client';

import { useRouter } from 'next/navigation';
import { Hourglass } from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function PendingPage() {
  const router = useRouter();
  const logout = useLogout();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <Hourglass className="text-teal-600" size={44} />
      <h1 className="mt-4 font-(family-name:--font-display) text-2xl font-bold">Account pending approval</h1>
      <p className="mt-2 text-muted-foreground">
        Your email is verified. Our team is reviewing new accounts and will email you once yours is approved.
      </p>
      <Button
        variant="outline"
        className="mt-6 rounded-full"
        onClick={async () => { await logout.mutateAsync(); router.replace('/'); }}
      >
        Log out
      </Button>
    </div>
  );
}