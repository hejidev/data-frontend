'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import type { SiteSettings } from '@/lib/site';

export function Providers({
  children,
  initialSite,
}: {
  children: React.ReactNode;
  initialSite: SiteSettings;
}) {
  const [queryClient] = useState(() => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false, retry: 1 },
      },
    });
    // Seed the company name so client components render it on first paint
    qc.setQueryData(['site-settings'], { settings: initialSite });
    return qc;
  });

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}