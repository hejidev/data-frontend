import { apiRequest } from './api';
import type { SiteSettings } from './site';

export type BlogPostDto = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  readingTime: number;
  publishedAt?: string;
  createdAt: string;
  author?: { full_name: string; avatar?: string } | string;
};

export type BlogListResponse = {
  posts: BlogPostDto[];
  total: number;
  page: number;
  pages: number;
  categories: string[];
};

export type FaqDto = {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
};

export type ContactMessageDto = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  createdAt: string;
};

export type LegalPageDto = {
  slug: string;
  title: string;
  content: string;
  version: number;
  updatedAt: string;
};

function qs(params?: Record<string, string | number | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

const json = (data: unknown) => JSON.stringify(data);

export const contentApi = {
  blog: {
    list: (p?: { page?: number; limit?: number; category?: string; q?: string }) =>
      apiRequest<BlogListResponse>(`/blog${qs(p)}`),
    adminAll: () => apiRequest<{ posts: BlogPostDto[] }>('/blog/admin/all'),
    create: (data: Record<string, unknown>) =>
      apiRequest('/blog', { method: 'POST', body: json(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      apiRequest(`/blog/${id}`, { method: 'PATCH', body: json(data) }),
    remove: (id: string) => apiRequest(`/blog/${id}`, { method: 'DELETE' }),
  },
  faqs: {
    list: () => apiRequest<{ faqs: FaqDto[]; categories: string[] }>('/faqs'),
    adminAll: () => apiRequest<{ faqs: FaqDto[] }>('/faqs/all'),
    create: (data: Record<string, unknown>) =>
      apiRequest('/faqs', { method: 'POST', body: json(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      apiRequest(`/faqs/${id}`, { method: 'PATCH', body: json(data) }),
    remove: (id: string) => apiRequest(`/faqs/${id}`, { method: 'DELETE' }),
  },
  contact: {
    send: (data: Record<string, unknown>) =>
      apiRequest('/contact', { method: 'POST', body: json(data) }),
    list: (status?: string) =>
      apiRequest<{ messages: ContactMessageDto[] }>(`/contact${qs({ status })}`),
    setStatus: (id: string, status: string) =>
      apiRequest(`/contact/${id}`, { method: 'PATCH', body: json({ status }) }),
  },
  legal: {
    get: (slug: string) => apiRequest<{ page: LegalPageDto }>(`/legal/${slug}`),
    save: (slug: string, data: { title: string; content: string }) =>
      apiRequest<{ page: LegalPageDto }>(`/legal/${slug}`, { method: 'PUT', body: json(data) }),
  },
  site: {
    settings: () => apiRequest<{ settings: SiteSettings }>('/public/settings'),
  },
};
