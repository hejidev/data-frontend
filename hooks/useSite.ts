'use client';

import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/lib/content-api';
import { DEFAULT_SITE, type SiteSettings } from '@/lib/site';

/** Live company name & contact settings. Seeded from the server, so there is no flash. */
export function useSite(): SiteSettings {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: contentApi.site.settings,
    staleTime: 60_000,
  });
  return data?.settings ?? DEFAULT_SITE;
}