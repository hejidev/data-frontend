import type { Metadata, Viewport } from 'next';
import { Manrope, Sora } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { getSiteSettings } from '@/lib/server-api';
import { Providers } from './providers';
import SiteShell from './components/SiteShell';
import { MaintenanceBanner } from '@/components/MaintenanceBanner';

const sora = Sora({ subsets: ['latin'], variable: '--font-display' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-body' });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${siteName} — Buy Data & Airtime in Nigeria`, template: `%s | ${siteName}` },
    description: `Stop dialing USSD. Buy cheap MTN, Airtel, Glo and 9mobile data and airtime from one secure ${siteName} wallet.`,
    openGraph: {
      type: 'website',
      siteName,
      title: `${siteName} — Buy Data & Airtime in Nigeria`,
      description: 'One wallet for data, airtime and bills. No USSD.',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#041628' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${manrope.variable} min-h-screen bg-background font-(family-name:--font-body) text-foreground antialiased`}
      >
        <Providers initialSite={site}>
          <MaintenanceBanner />
          <SiteShell>{children}</SiteShell>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}