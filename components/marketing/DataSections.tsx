'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { api, type PlanDto } from '@/lib/api';
import { contentApi } from '@/lib/content-api';
import { naira } from '@/lib/format';
import { NETWORKS } from '@/lib/networks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogCard, BlogCardSkeleton } from './BlogCard';
import { FaqList, FaqSkeleton } from './FaqList';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/* ---------- Live plans ---------- */
export function PlansShowcase() {
  const q = useQuery({
    queryKey: ['public-plans'],
    queryFn: () => api.plans.getAll({ type: 'data' }),
  });

  const grouped = useMemo(() => {
    const m: Record<string, PlanDto[]> = {};
    (q.data?.plans || []).forEach((p) => (m[p.provider] ||= []).push(p));
    return m;
  }, [q.data]);

  return (
    <section className="border-y bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Live pricing"
          title="Affordable data plans"
          description="Straight from our catalogue — prices update the moment the admin changes them."
        />

        {q.isLoading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : q.isError ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">Couldn&apos;t load plans right now. Please refresh.</p>
        ) : (
          <Tabs defaultValue="MTN" className="mt-10">
            <TabsList className="mx-auto flex h-auto w-fit flex-wrap rounded-full p-1">
              {NETWORKS.map((n) => (
                <TabsTrigger key={n.id} value={n.id} className="rounded-full px-5 py-2">
                  <span className={`mr-2 h-2 w-2 rounded-full ${n.dot}`} />
                  {n.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {NETWORKS.map((n) => (
              <TabsContent key={n.id} value={n.id} className="mt-8">
                {(grouped[n.id] || []).length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">No {n.label} plans listed yet.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {grouped[n.id].map((p) => (
                      <div key={p._id} className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg">
                        <div className="font-(family-name:--font-display) text-2xl font-bold">{p.dataSize}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {p.duration} {p.durationUnit} · {p.name}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-lg font-semibold text-teal-700 dark:text-teal-300">{naira(p.price)}</span>
                          <Link
                            href={`/auth/signup?intent=data&network=${p.provider}&plan=${p._id}`}
                            className="text-sm font-medium opacity-70 transition group-hover:opacity-100"
                          >
                            Buy →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </section>
  );
}

/* ---------- Latest blog posts ---------- */
export function LatestPosts() {
  const q = useQuery({ queryKey: ['blog', 'latest'], queryFn: () => contentApi.blog.list({ limit: 3 }) });
  const posts = q.data?.posts || [];
  if (!q.isLoading && posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading align="left" eyebrow="Blog" title="Guides, tips & updates" />
        <Reveal>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/blog">All articles <ArrowRight size={16} /></Link>
          </Button>
        </Reveal>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {q.isLoading
          ? Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)
          : posts.map((p) => <BlogCard key={p._id} post={p} />)}
      </div>
    </section>
  );
}

/* ---------- FAQ preview ---------- */
export function FaqPreview() {
  const q = useQuery({ queryKey: ['faqs'], queryFn: contentApi.faqs.list });
  const items = (q.data?.faqs || []).slice(0, 6);
  if (!q.isLoading && items.length === 0) return null;

  return (
    <section className="border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-10">{q.isLoading ? <FaqSkeleton rows={4} /> : <FaqList items={items} />}</div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/faq">See all questions</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}