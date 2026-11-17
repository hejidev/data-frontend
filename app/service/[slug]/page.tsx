import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaqList } from '@/components/marketing/FaqList';
import { PlansShowcase } from '@/components/marketing/DataSections';
import { CtaBand } from '@/components/marketing/StaticSections';
import { fillPlaceholders } from '@/lib/legal';
import { getSiteSettings } from '@/lib/server-api';
import { SERVICES, getService } from '@/lib/services-catalog';
import { serviceIcons } from '../page';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return { title: 'Service not found' };
  const { siteName } = await getSiteSettings();
  return { title: s.title, description: fillPlaceholders(s.description, { siteName }) };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  const { siteName } = await getSiteSettings();
  const fill = (t: string) => fillPlaceholders(t, { siteName });
  const Icon = serviceIcons[s.slug];

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <Link href="/service" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> All services
          </Link>
          <div className="mt-6 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white">
              <Icon size={26} />
            </span>
            <Badge variant={s.live ? 'default' : 'secondary'} className={s.live ? 'bg-teal-600 text-white' : ''}>
              {s.live ? 'Live now' : 'Coming soon'}
            </Badge>
          </div>
          <h1 className="mt-5 font-(family-name:--font-display) text-4xl font-bold tracking-tight sm:text-5xl">{s.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{fill(s.description)}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {s.live ? (
              <Button asChild className="rounded-full bg-teal-600 px-7 text-white hover:bg-teal-700">
                <Link href="/auth/signup">Get started</Link>
              </Button>
            ) : (
              <Button asChild className="rounded-full bg-teal-600 px-7 text-white hover:bg-teal-700">
                <Link href={`/contact?subject=${encodeURIComponent(`Notify me: ${s.title}`)}`}>Notify me</Link>
              </Button>
            )}
            {s.live && (s.slug === 'data' || s.slug === 'airtime') && (
              <Button asChild variant="outline" className="rounded-full px-7">
                <Link href="/pricing">See pricing</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
        <div>
          <h2 className="font-(family-name:--font-display) text-xl font-bold">What you get</h2>
          <ul className="mt-4 space-y-3">
            {s.features.map((f) => (
              <li key={f} className="flex gap-3 text-sm">
                <Check size={18} className="mt-0.5 shrink-0 text-teal-600" /> {fill(f)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-(family-name:--font-display) text-xl font-bold">How it works</h2>
          <ol className="mt-4 space-y-4">
            {s.steps.map((st, i) => (
              <li key={st} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{i + 1}</span>
                {fill(st)}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {s.slug === 'data' && <PlansShowcase />}

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-(family-name:--font-display) text-2xl font-bold">Frequently asked</h2>
        <div className="mt-8">
          <FaqList
            items={s.faqs.map((f, i) => ({
              _id: `${s.slug}-${i}`, question: fill(f.q), answer: fill(f.a), category: '', order: i, isPublished: true,
            }))}
          />
        </div>
      </section>
      <CtaBand />
    </>
  );
}