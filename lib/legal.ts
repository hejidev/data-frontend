import { formatDate } from './format';
import type { SiteSettings } from './site';

export const LEGAL_PAGES = [
  { slug: 'terms', label: 'Terms of Service' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'refund-policy', label: 'Refund Policy' },
] as const;

export function siteValues(site: SiteSettings, updatedAt?: string): Record<string, string> {
  return {
    siteName: site.siteName,
    legalName: site.legalName || site.siteName,
    address: site.address,
    rcNumber: site.rcNumber,
    supportEmail: site.supportEmail,
    supportPhone: site.supportPhone,
    effectiveDate: updatedAt ? formatDate(updatedAt) : '',
  };
}

/**
 * Replaces {{placeholders}}. A line whose placeholder has no value is dropped,
 * so "Phone: {{supportPhone}}" simply disappears until a phone number is set.
 */
export function fillPlaceholders(text: string, values: Record<string, string>): string {
  return text
    .split('\n')
    .filter((line) =>
      [...line.matchAll(/\{\{(\w+)\}\}/g)].every((m) => (values[m[1]] ?? '') !== '')
    )
    .map((line) => line.replace(/\{\{(\w+)\}\}/g, (_, k: string) => values[k] ?? ''))
    .join('\n');
}