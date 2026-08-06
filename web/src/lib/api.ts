import type { Article, ArticleList, Category } from './types';
import type { Lang } from './lang';

// Fetch server-side memerlukan URL absolut (relative URL gagal di luar request context,
// mis. saat static generation). Route handlers berada di origin yang sama dengan web.
const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

const langQ = (lang?: Lang) => (lang ? `&lang=${lang}` : '');

async function get<T>(path: string, opts: RequestInit = {}): Promise<T | null> {
  const { next, ...rest } = opts;
  try {
    const res = await fetch(`${baseUrl}${path}`, { next: next ?? { revalidate: 30 }, ...rest });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error('[API]', err);
    return null;
  }
}

export const api = {
  categories: (lang?: Lang) => get<Category[]>(`/api/categories?lang=${lang ?? 'id'}`),
  headlines: (limit = 5, lang?: Lang) =>
    get<Article[]>(`/api/articles/headlines?limit=${limit}${langQ(lang)}`),
  trending: (limit = 6, lang?: Lang) =>
    get<Article[]>(`/api/articles/trending?limit=${limit}${langQ(lang)}`),
  latest: (category?: string, limit = 12, offset = 0, lang?: Lang) =>
    get<ArticleList>(
      `/api/articles?category=${encodeURIComponent(category ?? '')}&limit=${limit}&offset=${offset}${langQ(lang)}`
    ),
  categoryArticles: (category: string, limit = 12, offset = 0, lang?: Lang) =>
    get<ArticleList>(
      `/api/articles?category=${encodeURIComponent(category)}&limit=${limit}&offset=${offset}${langQ(lang)}`
    ),
  // no-store agar setiap kunjungan benar-benar menambah views
  article: (slug: string, lang?: Lang) =>
    get<Article>(`/api/articles/${encodeURIComponent(slug)}?lang=${lang ?? 'id'}`, {
      cache: 'no-store',
    }),
  related: (slug: string, lang?: Lang) =>
    get<Article[]>(`/api/articles/${encodeURIComponent(slug)}/related?limit=4${langQ(lang)}`),
  search: (q: string, lang?: Lang) =>
    get<ArticleList>(`/api/search?q=${encodeURIComponent(q)}${langQ(lang)}`),
};
