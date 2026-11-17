'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { api } from '@/lib/api';
import { naira } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationBell } from './NotificationBell';

export function UserTopbar() {
  const wallet = useQuery({ queryKey: ['wallet'], queryFn: api.wallet.balance });
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-end gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-8">
      <Link href="/user/wallet" className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition hover:bg-accent">
        <Wallet size={15} className="text-teal-600" />
        {wallet.isLoading ? <Skeleton className="h-4 w-14" /> : naira(wallet.data?.balance ?? 0)}
      </Link>
      <NotificationBell />
      <ThemeToggle />
    </div>
  );
}