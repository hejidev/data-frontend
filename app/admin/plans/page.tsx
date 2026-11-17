'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPlansPage() {
  const qc = useQueryClient();
  const plans = useQuery({
    queryKey: ['admin-plans'],
    queryFn: api.plans.getAdminAll,
  });
  const [form, setForm] = useState({
    name: '',
    provider: 'MTN',
    type: 'data',
    dataSize: '',
    duration: 30,
    price: 500,
    planCode: '',
  });

  const create = useMutation({
    mutationFn: () => api.plans.create(form),
    onSuccess: () => {
      toast.success('Plan created');
      qc.invalidateQueries({ queryKey: ['admin-plans'] });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Failed'),
  });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.plans.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] }),
  });

  const setPrice = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) => api.plans.update(id, { price }),
    onSuccess: () => { toast.success('Price updated'); qc.invalidateQueries({ queryKey: ['admin-plans'] }); },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed'),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Plans
        </h1>
        <p className="text-slate-600">Manage network data and airtime catalog.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
            {(['name', 'provider', 'type', 'dataSize', 'planCode'] as const).map(
              (key) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key}</Label>
                  <Input
                    value={(form as any)[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    required={key !== 'planCode'}
                  />
                </div>
              )
            )}
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
              />
            </div>
            <Button
              type="submit"
              className="bg-[#0f766e] hover:bg-[#0d9488] md:col-span-2"
            >
              Create plan
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(plans.data?.plans || []).map((p) => (
            <div
              key={p._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2"
            >
              <div>
                <div className="font-medium">
                  {p.provider} · {p.name} · {p.dataSize}
                </div>
                <div className="text-sm text-slate-500">
                  ₦{p.price.toLocaleString()} · {p.type} · {p.isActive ? 'active' : 'inactive'}
                  {p.costPrice ? (
                    <span className={p.price < p.costPrice ? 'font-semibold text-red-600' : ''}>
                      {' '}· cost ₦{p.costPrice.toLocaleString()} · margin ₦{(p.price - p.costPrice).toLocaleString()}
                    </span>
                  ) : null}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toggle.mutate({ id: p._id, isActive: !p.isActive })
                }
              >
                {p.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                const v = Number(prompt('New selling price (₦)', String(p.price)));
                if (v > 0) setPrice.mutate({ id: p._id, price: v });
              }}>
                Edit price
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
