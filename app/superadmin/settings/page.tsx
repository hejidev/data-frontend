'use client';

import { useEffect, useState } from 'react';
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
import { revalidateSite } from '@/app/actions';

export default function SettingsPage() {
  const qc = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: api.admin.settings,
  });
  const [form, setForm] = useState({
    siteName: '',
    supportEmail: '',
    supportPhone: '',
    vtuMode: 'mock',
    maintenanceMode: false,
    minWalletFund: 100,
    maxWalletFund: 500000,
    referralEnabled: false,
    referralRewardNaira: 100,
    referralMinPurchaseNaira: 500,
    referralMaxPerReferrer: 50,
    airtimeCostPercent: 100,

  });

  useEffect(() => {
    if (settingsQuery.data?.settings) {
      const s = settingsQuery.data.settings as any;
      setForm({
        siteName: s.siteName || '',
        supportEmail: s.supportEmail || '',
        supportPhone: s.supportPhone || '',
        vtuMode: s.vtuMode || 'mock',
        maintenanceMode: !!s.maintenanceMode,
        minWalletFund: s.minWalletFund || 100,
        maxWalletFund: s.maxWalletFund || 500000,
        referralEnabled: !!s.referralEnabled,
        referralRewardNaira: s.referralRewardNaira ?? 100,
        referralMinPurchaseNaira: s.referralMinPurchaseNaira ?? 500,
        referralMaxPerReferrer: s.referralMaxPerReferrer ?? 50,
        airtimeCostPercent: s.airtimeCostPercent ?? 100,
      });
    }
  }, [settingsQuery.data]);

  const save = useMutation({
    mutationFn: () => api.admin.updateSettings(form),
    onSuccess: async () => {
      toast.success('Settings saved');
      qc.invalidateQueries({ queryKey: ['settings'] });
      await qc.invalidateQueries({ queryKey: ['site-settings'] });
      await revalidateSite();
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Failed'),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Settings
        </h1>
        <p className="text-slate-600">Platform mode, fees bounds, and branding.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Site name</Label>
            <Input
              value={form.siteName}
              onChange={(e) =>
                setForm((f) => ({ ...f, siteName: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Support email</Label>
            <Input
              value={form.supportEmail}
              onChange={(e) =>
                setForm((f) => ({ ...f, supportEmail: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Support phone</Label>
            <Input
              value={form.supportPhone}
              onChange={(e) =>
                setForm((f) => ({ ...f, supportPhone: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>VTU mode</Label>
            <Select
              value={form.vtuMode}
              onValueChange={(vtuMode) => setForm((f) => ({ ...f, vtuMode }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mock">Mock (sandbox)</SelectItem>
                <SelectItem value="live">Live (VTpass)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Min fund</Label>
              <Input
                type="number"
                value={form.minWalletFund}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    minWalletFund: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Max fund</Label>
              <Input
                type="number"
                value={form.maxWalletFund}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxWalletFund: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  maintenanceMode: e.target.checked,
                }))
              }
            />
            Maintenance mode
          </label>
          <Button
            className="bg-[#0f766e] hover:bg-[#0d9488]"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            Save settings
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Referral programme</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.referralEnabled} onChange={(e) => setForm((f) => ({ ...f, referralEnabled: e.target.checked }))} />
            Programme active
          </label>
          <div className="grid grid-cols-3 gap-3">
            {([
              ['referralRewardNaira', 'Reward (₦)'],
              ['referralMinPurchaseNaira', 'Min. first purchase (₦)'],
              ['referralMaxPerReferrer', 'Max rewards per person'],
            ] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input type="number" min={0} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Keep the reward below your profit on the minimum purchase, or each referral loses money.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Profit & referrals</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Airtime cost % (what you pay VTpass per ₦100 sold)</Label>
            <Input type="number" min={50} max={100} step="0.1" value={form.airtimeCostPercent} onChange={(e) => setForm((f) => ({ ...f, airtimeCostPercent: Number(e.target.value) }))} className="max-w-40" />
            <p className="text-xs text-muted-foreground">E.g. 97 means you keep ₦3 profit on every ₦100. Used for profit reports only.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.referralEnabled} onChange={(e) => setForm((f) => ({ ...f, referralEnabled: e.target.checked }))} />
            Referral programme active
          </label>
          <div className="grid grid-cols-3 gap-3">
            {([
              ['referralRewardNaira', 'Reward (₦)'],
              ['referralMinPurchaseNaira', 'Min. first purchase (₦)'],
              ['referralMaxPerReferrer', 'Max rewards per person'],
            ] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input type="number" min={0} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Keep the reward below your profit on the minimum purchase, or each referral loses money.</p>
        </CardContent>
      </Card>
    </div>
  );
}
