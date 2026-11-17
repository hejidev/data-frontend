'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSite } from '@/hooks/useSite';
import { QuickBuy } from './QuickBuy';

const trust = [
  { icon: ShieldCheck, label: 'Secured by Paystack' },
  { icon: RefreshCw, label: 'Auto-refund on failed orders' },
  { icon: CheckCircle2, label: 'MTN · Airtel · Glo · 9mobile' },
];

export function Hero() {
  const { siteName } = useSite();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 text-teal-900 dark:text-teal-100">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-teal-400/25 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
            Data & airtime live · Bills & global top-ups coming soon
          </span>
          <h1 className="mt-6 font-(family-name:--font-display) text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            One wallet for{' '}
            <span className="bg-gradient-to-r from-teal-500 to-sky-500 bg-clip-text text-transparent">
              data, airtime
            </span>{' '}
            and every bill.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Stop dialing USSD. Fund your {siteName} wallet once, then top up any Nigerian network in
            a few taps — with clear pricing and instant refunds if a delivery fails.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-teal-600 px-7 text-white hover:bg-teal-700">
              <Link href="/auth/signup">
                Create free account <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7">
              <Link href="/service">Explore services</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={16} className="text-teal-600" />
                {label}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-4 -top-5 z-10 hidden items-center gap-2 rounded-2xl border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex"
          >
            <CheckCircle2 size={14} className="text-teal-500" /> Payment confirmed
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-4 -right-3 z-10 hidden items-center gap-2 rounded-2xl border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex"
          >
            <RefreshCw size={14} className="text-sky-500" /> Auto-refund protection
          </motion.div>
          <QuickBuy />
        </motion.div>
      </div>
    </section>
  );
}