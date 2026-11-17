'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { FaqDto, contentApi } from '@/lib/content-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const empty = { question: '', answer: '', category: 'General', order: 0, isPublished: true };

export default function AdminFaqsPage() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const faqs = useQuery({ queryKey: ['admin-faqs'], queryFn: contentApi.faqs.adminAll });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-faqs'] });
    qc.invalidateQueries({ queryKey: ['faqs'] });
  };
  const reset = () => { setEditId(null); setForm(empty); };
  const onError = (e: unknown) => toast.error(e instanceof ApiError ? e.message : 'Failed');

  const save = useMutation({
    mutationFn: () => (editId ? contentApi.faqs.update(editId, form) : contentApi.faqs.create(form)),
    onSuccess: () => { toast.success(editId ? 'FAQ updated' : 'FAQ created'); reset(); refresh(); },
    onError,
  });
  const toggle = useMutation({
    mutationFn: (f: FaqDto) => contentApi.faqs.update(f._id, { isPublished: !f.isPublished }),
    onSuccess: refresh,
    onError,
  });
  const remove = useMutation({
    mutationFn: (id: string) => contentApi.faqs.remove(id),
    onSuccess: () => { toast.success('FAQ deleted'); refresh(); },
    onError,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">FAQs</h1>
        <p className="text-muted-foreground">Manage the questions shown on the public FAQ page.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{editId ? 'Edit FAQ' : 'Add FAQ'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Question</Label><Input value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Answer</Label><Textarea rows={4} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Order</Label><Input type="number" min={0} value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} /> Published
          </label>
          <div className="flex gap-2">
            <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled={save.isPending} onClick={() => save.mutate()}>{editId ? 'Update' : 'Create'}</Button>
            {editId && <Button variant="outline" onClick={reset}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All FAQs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {faqs.isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          {(faqs.data?.faqs || []).map((f) => (
            <div key={f._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{f.question}</div>
                <div className="text-xs text-muted-foreground">{f.category} · order {f.order}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{f.isPublished ? 'Published' : 'Hidden'}</Badge>
                <Button size="sm" variant="outline" onClick={() => toggle.mutate(f)}>{f.isPublished ? 'Hide' : 'Show'}</Button>
                <Button size="sm" variant="outline" onClick={() => { setEditId(f._id); setForm({ question: f.question, answer: f.answer, category: f.category, order: f.order, isPublished: f.isPublished }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => confirm('Delete this FAQ?') && remove.mutate(f._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}