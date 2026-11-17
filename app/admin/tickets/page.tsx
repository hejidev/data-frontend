'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminTicketsPage() {
  const qc = useQueryClient();
  const [reply, setReply] = useState<Record<string, string>>({});
  const tickets = useQuery({
    queryKey: ['tickets', 'all'],
    queryFn: () => api.tickets.getAll('all'),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => api.tickets.update(id, payload),
    onSuccess: () => {
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Tickets
        </h1>
        <p className="text-slate-600">Respond to customer support requests.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Open queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(tickets.data?.tickets || []).map((t) => (
            <div key={t._id} className="rounded-xl border p-4">
              <div className="flex justify-between gap-2">
                <div className="font-medium">{t.subject}</div>
                <div className="text-xs capitalize text-slate-500">{t.status}</div>
              </div>
              <p className="mt-1 text-sm text-slate-600">{t.message}</p>
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Reply…"
                  value={reply[t._id] || ''}
                  onChange={(e) =>
                    setReply((r) => ({ ...r, [t._id]: e.target.value }))
                  }
                />
                <Button
                  className="bg-[#0f766e] hover:bg-[#0d9488]"
                  onClick={() =>
                    update.mutate({
                      id: t._id,
                      payload: { response: reply[t._id], status: 'in_progress' },
                    })
                  }
                >
                  Reply
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
