import type { Metadata } from 'next';
import { PricingView } from '@/components/marketing/PricingView';
import { getSiteSettings } from '@/lib/server-api';

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  return { title: 'Pricing', description: `Live data and airtime prices on ${siteName}.` };
}

export default function PricingPage() {
  return <PricingView />;
}