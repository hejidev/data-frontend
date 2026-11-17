'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { BlogPostDto, contentApi } from '@/lib/content-api';
import { formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const empty = { title: '', excerpt: '', content: '', coverImage: '', category: 'General', tags: '', status: 'draft' as 'draft' | 'published' };

export default function AdminBlogPage() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState(false);

  const posts = useQuery({ queryKey: ['admin-blog'], queryFn: contentApi.blog.adminAll });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-blog'] });
    qc.invalidateQueries({ queryKey: ['blog'] });
  };
  const reset = () => { setEditId(null); setForm(empty); setPreview(false); };
  const onError = (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Failed');

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      return editId ? contentApi.blog.update(editId, payload) : contentApi.blog.create(payload);
    },
    onSuccess: () => { toast.success(editId ? 'Post updated' : 'Post created'); reset(); refresh(); },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => contentApi.blog.remove(id),
    onSuccess: () => { toast.success('Post deleted'); refresh(); },
    onError,
  });

  function edit(p: BlogPostDto) {
    setEditId(p._id);
    setForm({ title: p.title, excerpt: p.excerpt, content: p.content || '', coverImage: p.coverImage || '', category: p.category, tags: p.tags.join(', '), status: p.status });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground">Write and publish articles in Markdown.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{editId ? 'Edit post' : 'New post'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={set('title')} /></div>
            <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={set('category')} /></div>
            <div className="space-y-2"><Label>Cover image URL (optional)</Label><Input value={form.coverImage} onChange={set('coverImage')} placeholder="https://res.cloudinary.com/…" /></div>
            <div className="space-y-2"><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={set('tags')} /></div>
          </div>
          <div className="space-y-2"><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={set('excerpt')} /></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content (Markdown)</Label>
              <button type="button" className="text-xs text-teal-600 underline" onClick={() => setPreview((v) => !v)}>{preview ? 'Edit' : 'Preview'}</button>
            </div>
            {preview ? (
              <div className="prose prose-neutral min-h-48 max-w-none rounded-md border p-4 dark:prose-invert"><ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown></div>
            ) : (
              <Textarea rows={14} value={form.content} onChange={set('content')} className="font-mono text-sm" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={form.status} onChange={set('status')} className="h-9 rounded-md border bg-background px-3 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? 'Saving…' : editId ? 'Update post' : 'Create post'}
            </Button>
            {editId && <Button variant="outline" onClick={reset}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All posts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {posts.isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          {(posts.data?.posts || []).map((p) => (
            <div key={p._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.category} · {formatDate(p.publishedAt || p.createdAt)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.status === 'published' ? 'default' : 'secondary'} className={p.status === 'published' ? 'bg-teal-600 text-white' : ''}>{p.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => edit(p)}>Edit</Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => confirm('Delete this post?') && remove.mutate(p._id)}>Delete</Button>
              </div>
            </div>
          ))}
          {!posts.isLoading && !posts.data?.posts.length && <p className="text-sm text-muted-foreground">No posts yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}