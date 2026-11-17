'use client';

import { AlertTriangle } from 'lucide-react';
import { useSite } from '@/hooks/useSite';

export function MaintenanceBanner() {
  const { maintenanceMode } = useSite();
  if (!maintenanceMode) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-amber-500/15 px-4 py-2.5 text-center text-sm text-amber-900 dark:text-amber-200">
      <AlertTriangle size={15} className="shrink-0" />
      Purchases are paused for a short maintenance. Your wallet and money are safe.
    </div>
  );
}