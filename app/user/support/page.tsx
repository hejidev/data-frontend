'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserSupportPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    subject: '',
    category: 'general',
    message: '',
  });

  useEffect(() => {
    const order = new URLSearchParams(window.location.search).get('order');
    if (order) {
      setForm({ subject: `Problem with order ${order}`, category: 'order', message: `Order reference: ${order}\n\nWhat went wrong?\n` });
    }
  }, []);

  const tickets = useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.tickets.getAll(),
  });

  const create = useMutation({
    mutationFn: () => api.tickets.create(form),
    onSuccess: () => {
      toast.success('Ticket created');
      setForm({ subject: '', category: 'general', message: '' });
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Failed'),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Support
        </h1>
        <p className="text-slate-600">Open a ticket and track responses.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                className="min-h-28 w-full rounded-md border px-3 py-2 text-sm"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-[#0f766e] hover:bg-[#0d9488]"
              disabled={create.isPending}
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your tickets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(tickets.data?.tickets || []).map((t) => (
            <div key={t._id} className="rounded-xl border p-3">
              <div className="flex justify-between gap-2">
                <div className="font-medium">{t.subject}</div>
                <div className="text-xs capitalize text-slate-500">{t.status}</div>
              </div>
              <p className="mt-1 text-sm text-slate-600">{t.message}</p>
              {t.responses?.length > 0 && (
                <div className="mt-2 space-y-1 border-t pt-2 text-sm">
                  {t.responses.map((r, i) => (
                    <div key={i} className="text-slate-700">
                      <span className="font-medium">
                        {r.isAdmin ? 'Support' : 'You'}:
                      </span>{' '}
                      {r.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
