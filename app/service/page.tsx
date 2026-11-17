import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Gift, Globe, GraduationCap, PhoneCall, Smartphone, Tv, Wallet, Zap, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/marketing/Reveal';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import { CtaBand } from '@/components/marketing/StaticSections';
import { fillPlaceholders } from '@/lib/legal';
import { getSiteSettings } from '@/lib/server-api';
import { SERVICES, type ServiceSlug } from '@/lib/services-catalog';

export const serviceIcons: Record<ServiceSlug, LucideIcon> = {
  data: Smartphone, airtime: PhoneCall, wallet: Wallet, 'cable-tv': Tv,
  electricity: Zap, education: GraduationCap, international: Globe, 'gift-cards': Gift,
};

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  return { title: 'Services', description: `Data, airtime and bill payments on ${siteName}.` };
}

export default async function ServicesPage() {
  const { siteName } = await getSiteSettings();
  const fill = (s: string) => fillPlaceholders(s, { siteName });

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <SectionHeading
          eyebrow="Services"
          title={`Everything you pay for on ${siteName}`}
          description="Data, airtime and your wallet are live today. More bill payments are on the way."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = serviceIcons[s.slug];
            return (
              <Reveal key={s.slug} delay={i * 0.04}>
                <Link href={`/service/${s.slug}`} className="group flex h-full flex-col rounded-3xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-600 transition group-hover:bg-teal-600 group-hover:text-white">
                      <Icon size={22} />
                    </span>
                    <Badge variant={s.live ? 'default' : 'secondary'} className={s.live ? 'bg-teal-600 text-white' : ''}>
                      {s.live ? 'Live' : 'Coming soon'}
                    </Badge>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold">{s.title}</h2>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{fill(s.tagline)}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700 dark:text-teal-300">
                    Learn more <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
      <div className="pt-20">
        <CtaBand />
      </div>
    </>
  );
}