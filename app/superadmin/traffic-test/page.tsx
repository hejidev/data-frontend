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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TrafficTestPage() {
  const [testType, setTestType] = useState('standard');
  const [duration, setDuration] = useState(5000);
  const [concurrentUsers, setConcurrentUsers] = useState(100);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['traffic-metrics'],
    queryFn: api.admin.trafficMetrics,
    refetchInterval: 30000,
  });

  const testMutation = useMutation({
    mutationFn: () =>
      api.admin.trafficTest({ testType, duration, concurrentUsers }),
    onSuccess: () => {
      toast.success('Load test completed');
      queryClient.invalidateQueries({ queryKey: ['traffic-metrics'] });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : 'Failed'),
  });

  const analytics = (data as any)?.analytics?.metrics || {};
  const traffic = (data as any)?.analytics?.trafficData || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Traffic & Load Test
        </h1>
        <p className="text-slate-600">
          Live Redis request counters plus synthetic load simulations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Requests today', traffic.requests],
          ['Unique visitors', traffic.uniqueVisitors],
          ['Server load', `${Number(analytics.serverLoad || 0).toFixed(1)}%`],
          ['Avg response', `${Number(analytics.responseTime || 0).toFixed(0)}ms`],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {isLoading ? '…' : value ?? 0}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run load test</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Test type</Label>
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="spike">Spike</SelectItem>
                <SelectItem value="soak">Soak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Duration (ms)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Concurrent users</Label>
            <Input
              type="number"
              value={concurrentUsers}
              onChange={(e) => setConcurrentUsers(Number(e.target.value))}
            />
          </div>
          <Button
            className="bg-[#0f766e] hover:bg-[#0d9488] md:col-span-3"
            disabled={testMutation.isPending}
            onClick={() => testMutation.mutate()}
          >
            {testMutation.isPending ? 'Running…' : 'Run test'}
          </Button>
          {testMutation.data ? (
            <pre className="md:col-span-3 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-teal-100">
              {JSON.stringify(testMutation.data, null, 2)}
            </pre>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
