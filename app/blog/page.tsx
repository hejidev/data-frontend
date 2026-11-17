import type { Metadata } from 'next';
import { BlogIndexView } from '@/components/marketing/BlogIndexView';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Guides, tips and updates on data, airtime and everyday payments.',
};

export default function BlogPage() {
  return <BlogIndexView />;
}