'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupportWorkbenchPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [response, setResponse] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', selectedStatus],
    queryFn: () => api.tickets.getAll(selectedStatus),
  });

  const stats = useQuery({
    queryKey: ['ticket-stats'],
    queryFn: api.tickets.stats,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      api.tickets.update(id, payload),
    onSuccess: () => {
      toast.success('Ticket updated');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
      setResponse('');
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Support Workbench
        </h1>
        <p className="text-slate-600">
          Triage customer tickets and reply from one place.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['Open', stats.data?.open],
          ['In progress', stats.data?.inProgress],
          ['Resolved', stats.data?.resolved],
          ['Closed', stats.data?.closed],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{value ?? 0}</CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Label>Filter</Label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[28rem] space-y-2 overflow-y-auto">
            {isLoading && <p>Loading…</p>}
            {(data?.tickets || []).map((ticket) => (
              <button
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full rounded-xl border px-3 py-3 text-left ${
                  selectedTicket?._id === ticket._id
                    ? 'border-[#0f766e] bg-teal-50'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{ticket.subject}</span>
                  <Badge variant="secondary" className="capitalize">
                    {ticket.status}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {ticket.message}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket detail</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTicket ? (
              <p className="text-sm text-slate-500">Select a ticket</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="font-semibold">{selectedTicket.subject}</div>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedTicket.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(status) =>
                      updateMutation.mutate({
                        id: selectedTicket._id,
                        payload: { status },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reply</Label>
                  <Input
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Write a response…"
                  />
                  <Button
                    className="bg-[#0f766e] hover:bg-[#0d9488]"
                    disabled={!response || updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: selectedTicket._id,
                        payload: { response },
                      })
                    }
                  >
                    Send reply
                  </Button>
                </div>
                <div className="space-y-2 border-t pt-3">
                  {(selectedTicket.responses || []).map((r: any, i: number) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">
                        {r.isAdmin ? 'Agent' : 'User'}:
                      </span>{' '}
                      {r.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
