import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import type { BlogPostDto } from '@/lib/content-api';

export function BlogCard({ post, featured = false }: { post: BlogPostDto; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex overflow-hidden rounded-3xl border bg-card transition hover:-translate-y-1 hover:shadow-xl ${
        featured ? 'flex-col md:col-span-2 md:flex-row' : 'flex-col'
      }`}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br from-teal-500/30 to-sky-500/30 ${featured ? 'aspect-[16/10] md:aspect-auto md:w-1/2' : 'aspect-[16/10]'}`}>
        {post.coverImage ? (
          <Image src={post.coverImage} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center font-(family-name:--font-display) text-5xl font-bold text-teal-700/40 dark:text-teal-200/40">
            {post.category.charAt(0)}
          </div>
        )}
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? 'md:justify-center md:p-10' : ''}`}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-teal-600/10 px-2.5 py-1 font-medium text-teal-700 dark:text-teal-300">{post.category}</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span>· {post.readingTime} min read</span>
        </div>
        <h3 className={`mt-3 font-(family-name:--font-display) font-bold leading-snug ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
      </div>
    </Link>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}