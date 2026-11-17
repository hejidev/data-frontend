'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { revalidateSite } from '@/app/actions';
import { ApiError } from '@/lib/api';
import { contentApi } from '@/lib/content-api';
import { LEGAL_PAGES, fillPlaceholders, siteValues } from '@/lib/legal';
import { useSite } from '@/hooks/useSite';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

export default function AdminLegalPage() {
  const qc = useQueryClient();
  const site = useSite();
  const [slug, setSlug] = useState<string>(LEGAL_PAGES[0].slug);
  const [form, setForm] = useState({ title: '', content: '' });
  const [preview, setPreview] = useState(false);

  const page = useQuery({ queryKey: ['legal', slug], queryFn: () => contentApi.legal.get(slug) });

  useEffect(() => {
    if (page.data) setForm({ title: page.data.page.title, content: page.data.page.content });
  }, [page.data]);

  const save = useMutation({
    mutationFn: () => contentApi.legal.save(slug, form),
    onSuccess: async () => {
      toast.success('Saved. The public page updates within a minute.');
      qc.invalidateQueries({ queryKey: ['legal', slug] });
      await revalidateSite();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Legal pages</h1>
        <p className="text-muted-foreground">
          Markdown. Placeholders: {'{{siteName}} {{legalName}} {{address}} {{rcNumber}} {{supportEmail}} {{supportPhone}}'}.
          Set the company details under Branding. A line with an empty placeholder is hidden automatically.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LEGAL_PAGES.map((p) => (
          <button key={p.slug} onClick={() => setSlug(p.slug)} className={cn('rounded-full border px-4 py-1.5 text-sm', slug === p.slug ? 'border-teal-600 bg-teal-600 text-white' : 'hover:bg-accent')}>
            {p.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Edit {LEGAL_PAGES.find((p) => p.slug === slug)?.label}
            {page.data && <span className="ml-2 text-xs font-normal text-muted-foreground">v{page.data.page.version}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {page.isLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <div className="flex justify-end">
                <button type="button" className="text-xs text-teal-600 underline" onClick={() => setPreview((v) => !v)}>
                  {preview ? 'Edit' : 'Preview'}
                </button>
              </div>
              {preview ? (
                <div className="prose prose-neutral min-h-64 max-w-none rounded-md border p-4 dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {fillPlaceholders(form.content, siteValues(site, new Date().toISOString()))}
                  </ReactMarkdown>
                </div>
              ) : (
                <Textarea rows={22} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="font-mono text-sm" />
              )}
              <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled={save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}