'use client';

import Link from 'next/link';
import { ArrowRight, Gift, Globe, GraduationCap, Headset, PhoneCall, Receipt, RefreshCw, ShieldCheck, Smartphone, Tv, TrendingUp, Wallet, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSite } from '@/hooks/useSite';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/* ---------- Network marquee ---------- */
const marquee = ['MTN', 'Airtel', 'Glo', '9mobile', 'Paystack', 'Cable TV · soon', 'Electricity · soon', 'International · soon'];

export function NetworkMarquee() {
  const items = [...marquee, ...marquee];
  return (
    <div className="overflow-hidden border-y bg-muted/30 py-4" aria-hidden>
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap text-sm font-medium text-muted-foreground">
        {items.map((m, i) => (
          <span key={i} className="flex items-center gap-12">
            {m}
            <span className="h-1 w-1 rounded-full bg-teal-500" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Services bento ---------- */
const services = [
  { icon: Smartphone, title: 'Data bundles', body: 'Daily, weekly and monthly bundles for every network, priced live from the admin catalogue.', live: true, big: true },
  { icon: PhoneCall, title: 'Airtime top-up', body: 'Any amount from ₦50 to any Nigerian number.', live: true },
  { icon: Wallet, title: 'Smart wallet', body: 'Fund once with Paystack. Every credit and debit is in your ledger.', live: true },
  { icon: Tv, title: 'Cable TV', body: 'Renew your decoder subscription from your wallet.', live: false },
  { icon: Zap, title: 'Electricity', body: 'Prepaid and postpaid meter payments with instant tokens.', live: false },
  { icon: GraduationCap, title: 'Education pins', body: 'Exam result checkers and registration pins.', live: false },
  { icon: Globe, title: 'International top-up', body: 'Send airtime and data abroad in local currencies.', live: false, big: true },
  { icon: Gift, title: 'Gift cards & eSIM', body: 'Digital gift cards and travel eSIMs.', live: false },
];

export function Services() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Services"
        title="Everything you pay for, in one place"
        description="Data and airtime are live today. The rest of your daily bills are on the way."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <Reveal
            key={s.title}
            delay={i * 0.04}
            className={`group relative overflow-hidden rounded-3xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-xl ${s.big ? 'lg:col-span-2' : ''}`}
          >
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-600 transition group-hover:bg-teal-600 group-hover:text-white">
                <s.icon size={22} />
              </span>
              <Badge variant={s.live ? 'default' : 'secondary'} className={s.live ? 'bg-teal-600 text-white' : ''}>
                {s.live ? 'Live' : 'Coming soon'}
              </Badge>
            </div>
            <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
const steps = [
  ['Create your account', 'Sign up in under a minute. New accounts get a quick review before activation.'],
  ['Fund your wallet', 'Pay with Paystack. Your balance updates as soon as the payment is confirmed.'],
  ['Buy and go', 'Choose a network and plan, enter the number and confirm. Failed orders are refunded automatically.'],
];

export function HowItWorks() {
  return (
    <section className="border-y bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="How it works" title="Three steps. No USSD." />
        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent md:block" />
          {steps.map(([title, body], i) => (
            <Reveal key={title} delay={i * 0.1} className="relative text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 font-(family-name:--font-display) text-xl font-bold text-white shadow-lg shadow-teal-600/30">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Why us ---------- */
const reasons = [
  { icon: ShieldCheck, title: 'Secure payments', body: 'Card and bank payments are handled by Paystack. We never store card details.' },
  { icon: RefreshCw, title: 'Automatic refunds', body: 'If a delivery fails, your wallet is credited back and the refund shows in your ledger.' },
  { icon: TrendingUp, title: 'Transparent pricing', body: 'Plan prices come straight from our live catalogue — what you see is what you pay.' },
  { icon: Receipt, title: 'Full order history', body: 'Every purchase has a reference, status and timestamp you can look up anytime.' },
  { icon: Headset, title: 'Real support', body: 'Open a ticket from your dashboard and track the reply in one place.' },
  { icon: Wallet, title: 'Wallet ledger', body: 'A clear credit/debit trail for every naira that moves through your account.' },
];

export function WhyUs() {
  const { siteName } = useSite();
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow={`Why ${siteName}`} title="Built for trust, not just speed" />
      <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((r, i) => (
          <Reveal key={r.title} delay={i * 0.04} y={12} className="bg-card p-7">
            <r.icon className="text-teal-600" size={24} />
            <h3 className="mt-4 font-semibold">{r.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Global roadmap ---------- */
const roadmap = ['Cable TV & electricity', 'Multi-currency wallets', 'International airtime & data', 'Travel eSIMs', 'Mobile app (iOS & Android)'];

export function GlobalSection() {
  const { siteName } = useSite();
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <Reveal className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#041628] via-[#0b3b4a] to-teal-700 p-8 text-white sm:p-12">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-teal-200">On the roadmap</span>
            <h2 className="mt-3 font-(family-name:--font-display) text-3xl font-bold sm:text-4xl">
              Starting in Nigeria. Built to go global.
            </h2>
            <p className="mt-3 text-teal-50/80">
              {siteName} is being designed around a provider-agnostic core, so new bill types and
              countries can be added without changing how you pay.
            </p>
            <Button asChild className="mt-6 rounded-full bg-white text-[#041628] hover:bg-teal-50">
              <Link href="/contact">
                Tell us what you need <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          <ul className="grid gap-2.5">
            {roadmap.map((r) => (
              <li key={r} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-teal-300" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- CTA ---------- */
export function CtaBand() {
  const { siteName } = useSite();
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <Reveal className="rounded-[2rem] border bg-card px-6 py-14 text-center sm:px-12">
        <h2 className="font-(family-name:--font-display) text-3xl font-bold sm:text-4xl">
          Ready to leave USSD behind?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Create your free {siteName} account and make your first top-up in minutes.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full bg-teal-600 px-8 text-white hover:bg-teal-700">
            <Link href="/auth/signup">Get started free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}