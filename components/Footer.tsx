'use client';

import Link from 'next/link';
import { Wifi } from 'lucide-react';
import { useSite } from '@/hooks/useSite';

const cols = [
  {
    title: 'Product',
    links: [
      ['Services', '/service'],
      ['Create account', '/auth/signup'],
      ['Login', '/auth/login'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/about'],
      ['Blog', '/blog'],
      ['Contact', '/contact'],
    ],
  },
  {
    title: 'Support',
    links: [
      ['FAQ', '/faq'],
      ['Help tickets', '/user/support'],
    ],
  },
];

export default function Footer() {
  const { siteName, supportEmail } = useSite();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Wifi size={18} />
            </span>
            <span className="font-(family-name:--font-display) text-xl font-bold">{siteName}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            One wallet for data, airtime and the bills you pay every day. Built in Nigeria,
            designed to go global.
          </p>
          {supportEmail && (
            <a href={`mailto:${supportEmail}`} className="mt-3 block text-sm text-muted-foreground hover:text-foreground">
              {supportEmail}
            </a>
          )}
          <p className="mt-4 text-xs text-muted-foreground">MTN · Airtel · Glo · 9mobile</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold">{c.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteName}. All rights reserved.
      </div>
    </footer>
  );
}