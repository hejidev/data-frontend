import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlogCard } from '@/components/marketing/BlogCard';
import type { BlogPostDto } from '@/lib/content-api';
import { formatDate } from '@/lib/format';
import { getSiteSettings, serverFetch } from '@/lib/server-api';

type Data = { post: BlogPostDto; related: BlogPostDto[] };
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await serverFetch<Data>(`/blog/${slug}`);
  if (!data) return { title: 'Article not found' };
  const { post } = data;
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [data, { siteName }] = await Promise.all([
    serverFetch<Data>(`/blog/${slug}`),
    getSiteSettings(),
  ]);
  if (!data) notFound();

  const { post, related } = data;
  const author = typeof post.author === 'object' ? post.author.full_name : `${siteName} Team`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Organization', name: siteName },
    image: post.coverImage,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> All articles
      </Link>

      <header className="mt-6">
        <span className="rounded-full bg-teal-600/10 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-300">{post.category}</span>
        <h1 className="mt-4 font-(family-name:--font-display) text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        <div className="mt-5 text-sm text-muted-foreground">
          {author} · {formatDate(post.publishedAt)} · {post.readingTime} min read
        </div>
      </header>

      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border">
          <Image src={post.coverImage} alt="" fill priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
        </div>
      )}

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-(family-name:--font-display) prose-a:text-teal-600">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || ''}</ReactMarkdown>
      </div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">#{t}</span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t pt-10">
          <h2 className="font-(family-name:--font-display) text-2xl font-bold">Keep reading</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {related.slice(0, 2).map((p) => (
              <BlogCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}