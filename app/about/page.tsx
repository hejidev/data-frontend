import type { Metadata } from 'next';
import Link from 'next/link';
import { Eye, HeartHandshake, Lock, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/marketing/Reveal';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import { CtaBand } from '@/components/marketing/StaticSections';
import { getSiteSettings } from '@/lib/server-api';

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  return {
    title: 'About',
    description: `${siteName} is a Nigeria-first platform for data, airtime and everyday bills — built to go global.`,
  };
}

const values = [
  { icon: Eye, title: 'Clarity', body: 'Clear prices, clear statuses, clear refunds. No hidden steps.' },
  { icon: Lock, title: 'Trust', body: 'Payments via Paystack and a ledger for every naira that moves.' },
  { icon: Rocket, title: 'Speed', body: 'A few taps instead of long USSD menus.' },
  { icon: HeartHandshake, title: 'Support', body: 'Real people responding to real tickets.' },
];

const roadmap = [
  { phase: 'Phase 1', title: 'Data & airtime', status: 'Live', body: 'All four Nigerian networks, wallet funding, order history and support tickets.' },
  { phase: 'Phase 2', title: 'Everyday bills', status: 'Next', body: 'Cable TV, electricity and education pins from the same wallet.' },
  { phase: 'Phase 3', title: 'Going global', status: 'Planned', body: 'International airtime and data, multi-currency wallets and travel eSIMs.' },
  { phase: 'Phase 4', title: 'Mobile apps', status: 'Planned', body: 'Native iOS and Android apps on the same account.' },
];

export default async function AboutPage() {
  const { siteName } = await getSiteSettings();

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300">About {siteName}</span>
            <h1 className="mt-4 font-(family-name:--font-display) text-4xl font-bold tracking-tight sm:text-5xl">
              Paying for connectivity should be effortless.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              {siteName} is a Nigeria-first platform for buying mobile data and airtime without USSD
              codes. Fund a wallet once, top up any network anytime — and we&apos;re growing it into a
              complete suite for the bills you pay every day, locally and internationally.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild className="rounded-full bg-teal-600 text-white hover:bg-teal-700">
                <Link href="/auth/signup">Join {siteName}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="What we stand for" title="Our values" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06} className="rounded-3xl border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-600">
                <v.icon size={22} />
              </span>
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/30 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading eyebrow="Roadmap" title="Where we're headed" />
          <ol className="relative mt-12 space-y-8 border-l pl-8">
            {roadmap.map((r, i) => (
              <Reveal key={r.phase} delay={i * 0.06} y={12} className="relative">
                <span className={`absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-background ${r.status === 'Live' ? 'bg-teal-500' : 'bg-muted-foreground/40'}`} />
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground">{r.phase}</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${r.status === 'Live' ? 'bg-teal-600 text-white' : 'bg-muted'}`}>{r.status}</span>
                </div>
                <h3 className="mt-1 text-lg font-semibold">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <div className="pt-20">
        <CtaBand />
      </div>
    </>
  );
}