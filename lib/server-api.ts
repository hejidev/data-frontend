import { cache } from 'react';
import { DEFAULT_SITE, type SiteSettings } from './site';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/** Server-component fetch with ISR caching. Returns null on any failure. */
export async function serverFetch<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Company name + contact settings for server components, metadata and SEO. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const data = await serverFetch<{ settings: SiteSettings }>('/public/settings', 30);
  return { ...DEFAULT_SITE, ...(data?.settings ?? {}) };
});