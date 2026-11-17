'use client';

import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { contentApi } from '@/lib/content-api';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlogCard, BlogCardSkeleton } from './BlogCard';

export function BlogIndexView() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounce(q, 350);

  const query = useQuery({
    queryKey: ['blog', { page, category, q: dq }],
    queryFn: () => contentApi.blog.list({ page, limit: 9, category, q: dq }),
    placeholderData: keepPreviousData,
  });

  const posts = query.data?.posts || [];
  const showFeatured = page === 1 && !category && !dq && posts.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300">Blog</span>
        <h1 className="mt-3 font-(family-name:--font-display) text-4xl font-bold tracking-tight">Guides, tips & updates</h1>
        <p className="mt-3 text-muted-foreground">Practical advice on data, airtime and paying smarter.</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {['', ...(query.data?.categories || [])].map((c) => (
            <button
              key={c || 'all'}
              onClick={() => { setCategory(c); setPage(1); }}
              className={cn('rounded-full border px-4 py-1.5 text-sm transition', category === c ? 'border-teal-600 bg-teal-600 text-white' : 'hover:bg-accent')}
            >
              {c || 'All'}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search articles…" className="rounded-full pl-10" />
        </div>
      </div>

      <div className={cn('mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3', query.isPlaceholderData && 'opacity-60 transition-opacity')}>
        {query.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)
        ) : query.isError ? (
          <p className="col-span-full text-center text-sm text-muted-foreground">Couldn&apos;t load articles. Please refresh.</p>
        ) : posts.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">No articles found.</p>
        ) : (
          posts.map((p, i) => <BlogCard key={p._id} post={p} featured={showFeatured && i === 0} />)
        )}
      </div>

      {(query.data?.pages || 0) > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" className="rounded-full" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {query.data?.pages}</span>
          <Button variant="outline" size="icon" className="rounded-full" disabled={page >= (query.data?.pages || 1)} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}