import type { Metadata } from 'next';
import { FaqView } from '@/components/marketing/FaqView';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about accounts, wallet funding and orders.',
};

export default function FaqPage() {
  return <FaqView />;
}