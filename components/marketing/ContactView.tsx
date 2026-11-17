'use client';

import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Clock, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { ApiError } from '@/lib/api';
import { contentApi } from '@/lib/content-api';
import { useSite } from '@/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  subject: z.string().trim().min(3, 'Subject is too short'),
  message: z.string().trim().min(10, 'Tell us a little more (10+ characters)'),
});
type Form = z.infer<typeof schema>;
const empty: Form = { name: '', email: '', subject: '', message: '' };

export function ContactView({ initialSubject }: { initialSubject?: string }) {
  const { siteName, supportEmail, supportPhone } = useSite();
  const [form, setForm] = useState<Form>({ ...empty, subject: initialSubject ?? '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string[]>>>({});
  const [sent, setSent] = useState(false);

  const send = useMutation({
    mutationFn: (data: Form) => contentApi.contact.send(data),
    onSuccess: () => {
      toast.success('Message sent — we will get back to you.');
      setForm(empty);
      setSent(true);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not send message'),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }
    setErrors({});
    setSent(false);
    send.mutate(parsed.data);
  }

  const field = (key: keyof Form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
    'aria-invalid': !!errors[key],
  });
  const err = (key: keyof Form) =>
    errors[key]?.[0] && <p className="text-xs text-destructive">{errors[key]![0]}</p>;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300">Contact</span>
        <h1 className="mt-3 font-(family-name:--font-display) text-4xl font-bold tracking-tight">Let&apos;s talk</h1>
        <p className="mt-3 text-muted-foreground">
          Questions, partnership ideas or a bill type you&apos;d like us to add? Send a message and the{' '}
          {siteName} team will respond.
        </p>

        <div className="mt-8 space-y-3">
          {supportEmail && <InfoRow icon={Mail} label="Email" value={supportEmail} href={`mailto:${supportEmail}`} />}
          {supportPhone && <InfoRow icon={Phone} label="Phone" value={supportPhone} href={`tel:${supportPhone}`} />}
          <InfoRow icon={Clock} label="Support" value="Open a ticket anytime from your dashboard" />
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-3xl border bg-card p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" {...field('name')} />
            {err('name')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...field('email')} />
            {err('email')}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" {...field('subject')} />
          {err('subject')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" rows={6} {...field('message')} />
          {err('message')}
        </div>
        <Button type="submit" disabled={send.isPending} className="h-11 w-full rounded-full bg-teal-600 text-white hover:bg-teal-700">
          {send.isPending ? 'Sending…' : 'Send message'}
        </Button>
        {sent && <p className="text-center text-sm text-teal-700 dark:text-teal-300">Thanks! Your message has been received.</p>}
      </form>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) {
  const body = (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:border-teal-500">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600/10 text-teal-600">
        <Icon size={18} />
      </span>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href}>{body}</a> : body;
}