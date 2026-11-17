'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { ApiError, api } from '@/lib/api';
import { revalidateSite } from '@/app/actions';
import { useSite } from '@/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  siteName: z.string().trim().min(2, 'At least 2 characters').max(40, 'Max 40 characters'),
  supportEmail: z.string().trim().email('Enter a valid email').or(z.literal('')),
  supportPhone: z.string().trim().max(30),
  legalName: z.string().trim().max(120),
  address: z.string().trim().max(240),
  rcNumber: z.string().trim().max(30),
});
type Form = z.infer<typeof schema>;

const fields: [keyof Form, string, string][] = [
  ['siteName', 'Brand name', 'Shown across the site, emails and page titles'],
  ['legalName', 'Registered company name', 'Used in the Terms, Privacy and Refund pages'],
  ['rcNumber', 'CAC registration number', 'Optional, e.g. RC 1234567'],
  ['address', 'Business address', 'Shown on legal pages'],
  ['supportEmail', 'Support email', 'Shown on the contact page and footer'],
  ['supportPhone', 'Support phone', 'Shown on the contact page'],
];

export default function AdminBrandingPage() {
  const qc = useQueryClient();
  const site = useSite();
  const [form, setForm] = useState<Form>({ siteName: '', supportEmail: '', supportPhone: '', legalName: '', address: '', rcNumber: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      siteName: site.siteName, supportEmail: site.supportEmail, supportPhone: site.supportPhone,
      legalName: site.legalName, address: site.address, rcNumber: site.rcNumber,
    });
  }, [site]);

  const save = useMutation({
    mutationFn: () => api.admin.updateSettings(form),
    onSuccess: async () => {
      toast.success('Company details updated everywhere');
      await qc.invalidateQueries({ queryKey: ['site-settings'] });
      await revalidateSite();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed'),
  });

  function submit() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setError(null);
    save.mutate();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-(family-name:--font-display) text-3xl font-bold">Branding & company</h1>
        <p className="text-muted-foreground">These details appear on the website, emails and legal pages.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Company details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {fields.map(([key, label, hint]) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="bg-teal-600 text-white hover:bg-teal-700" disabled={save.isPending} onClick={submit}>
            {save.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}