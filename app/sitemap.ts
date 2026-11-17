import type { MetadataRoute } from 'next';
import type { BlogListResponse } from '@/lib/content-api';
import { LEGAL_PAGES } from '@/lib/legal';
import { serverFetch } from '@/lib/server-api';
import { SERVICES } from '@/lib/services-catalog';

const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = ['', '/service', '/pricing', '/about', '/contact', '/faq', '/blog', '/auth/login', '/auth/signup'];

  const posts: MetadataRoute.Sitemap = [];
  for (let page = 1; page <= 10; page++) {
    const data = await serverFetch<BlogListResponse>(`/blog?limit=24&page=${page}`, 300);
    if (!data) break;
    posts.push(
      ...data.posts.map((p) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      }))
    );
    if (page >= data.pages) break;
  }

  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, lastModified: now })),
    ...SERVICES.map((s) => ({ url: `${base}/service/${s.slug}`, lastModified: now })),
    ...LEGAL_PAGES.map((l) => ({ url: `${base}/legal/${l.slug}`, lastModified: now })),
    ...posts,
  ];
}