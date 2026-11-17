import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { LegalPageDto } from '@/lib/content-api';
import { formatDate } from '@/lib/format';
import { LEGAL_PAGES, fillPlaceholders, siteValues } from '@/lib/legal';
import { getSiteSettings, serverFetch } from '@/lib/server-api';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = LEGAL_PAGES.find((p) => p.slug === slug);
  const { siteName } = await getSiteSettings();
  return meta
    ? { title: meta.label, description: `${meta.label} for ${siteName}.` }
    : { title: 'Not found' };
}

export default async function LegalPageView({ params }: Props) {
  const { slug } = await params;
  if (!LEGAL_PAGES.some((p) => p.slug === slug)) notFound();

  const [data, site] = await Promise.all([
    serverFetch<{ page: LegalPageDto }>(`/legal/${slug}`, 60),
    getSiteSettings(),
  ]);
  if (!data) notFound();

  const { page } = data;
  const body = fillPlaceholders(page.content, siteValues(site, page.updatedAt));

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
        <nav className="mt-3 flex gap-2 lg:flex-col">
          {LEGAL_PAGES.map((p) => (
            <Link
              key={p.slug}
              href={`/legal/${p.slug}`}
              className={cn(
                'rounded-lg px-3 py-2 text-sm transition',
                p.slug === slug ? 'bg-teal-600/10 font-medium text-teal-700 dark:text-teal-300' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p.label}
            </Link>
          ))}
        </nav>
      </aside>

      <article>
        <h1 className="font-(family-name:--font-display) text-4xl font-bold tracking-tight">{page.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {formatDate(page.updatedAt)}</p>
        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-headings:font-(family-name:--font-display) prose-a:text-teal-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}