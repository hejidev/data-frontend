// app/contact/page.tsx
import type { Metadata } from 'next';
import { ContactView } from '@/components/marketing/ContactView';

export const metadata: Metadata = { title: 'Contact', description: 'Get in touch with our team.' };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  return <ContactView initialSubject={subject?.slice(0, 120)} />;
}