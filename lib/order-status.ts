export const ORDER_STATUS: Record<string, { label: string; tone: 'ok' | 'bad' | 'wait' }> = {
    success: { label: 'Delivered', tone: 'ok' },
    failed: { label: 'Failed — refunded', tone: 'bad' },
    reversed: { label: 'Reversed — refunded', tone: 'bad' },
    processing: { label: 'Processing', tone: 'wait' },
    pending: { label: 'Processing', tone: 'wait' },
  };
  
  export const toneClass = {
    ok: 'bg-teal-600/10 text-teal-700 dark:text-teal-300',
    bad: 'bg-destructive/10 text-destructive',
    wait: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  } as const;