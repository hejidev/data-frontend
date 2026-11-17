'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { contentApi } from '@/lib/content-api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaqList, FaqSkeleton } from './FaqList';

export function FaqView() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const query = useQuery({ queryKey: ['faqs'], queryFn: contentApi.faqs.list });

  const categories = ['All', ...(query.data?.categories || [])];
  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (query.data?.faqs || []).filter(
      (f) =>
        (category === 'All' || f.category === category) &&
        (!term || f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term))
    );
  }, [query.data, q, category]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300">FAQ</span>
        <h1 className="mt-3 font-(family-name:--font-display) text-4xl font-bold tracking-tight">How can we help?</h1>
        <p className="mt-3 text-muted-foreground">Quick answers about accounts, wallets and orders.</p>
      </div>

      <div className="relative mt-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions…" className="h-12 rounded-full pl-11" />
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn('rounded-full border px-4 py-1.5 text-sm transition', category === c ? 'border-teal-600 bg-teal-600 text-white' : 'hover:bg-accent')}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {query.isLoading ? (
          <FaqSkeleton rows={6} />
        ) : query.isError ? (
          <p className="text-center text-sm text-muted-foreground">Couldn&apos;t load FAQs. Please refresh.</p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No questions match your search.</p>
        ) : (
          <FaqList items={items} />
        )}
      </div>

      <div className="mt-12 rounded-3xl border bg-card p-8 text-center">
        <h2 className="font-semibold">Still need help?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Our team is happy to help.</p>
        <Button asChild className="mt-4 rounded-full bg-teal-600 text-white hover:bg-teal-700">
          <Link href="/contact">Contact support</Link>
        </Button>
      </div>
    </div>
  );
}