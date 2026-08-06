import type { Lang } from './lang';
import { getSupabase } from '@/lib/db';

/**
 * Kolom artikel untuk `.select()` PostgREST — kategori ikut ter-embed
 * (relasi many-to-one). Hasilnya di-*flatten* lewat `flattenArticle()`
 * menjadi bentuk kolom lama (category_id, category_slug, ...).
 */
export const ARTICLE_FIELDS = `
  id, slug, title, title_en, excerpt, excerpt_en, content, content_en,
  author, image_url, published_at, views, featured, created_at,
  categories (id, slug, name, name_en, color)
`
  .replace(/\s+/g, ' ')
  .trim();

type ArticleRow = Record<string, unknown>;

/**
 * Ratakan baris PostgREST (categories tersarang) menjadi bentuk kolom
 * kategori datar seperti hasil JOIN SQL sebelumnya.
 * Menerima `unknown` karena supabase-js mengetik data dari select string
 * non-literal sebagai `GenericStringError`.
 */
export function flattenArticle(row: unknown): ArticleRow {
  const r = (row ?? {}) as Record<string, unknown>;
  const categories = r.categories as Record<string, unknown> | null | undefined;
  const { categories: _drop, ...rest } = r;
  return {
    ...rest,
    category_id: (categories?.id as number | undefined) ?? null,
    category_slug: (categories?.slug as string | undefined) ?? null,
    category_name: (categories?.name as string | undefined) ?? null,
    category_name_en: (categories?.name_en as string | undefined) ?? null,
    category_color: (categories?.color as string | undefined) ?? null,
  };
}

/**
 * Tambah views secara atomik lewat fungsi SQL `increment_article_views`
 * (didefinisikan di scripts/schema.sql / seed). Bila fungsi belum ada di
 * database (skema lama), fallback ke baca-lalu-update (non-atomik).
 */
export async function incrementArticleViews(id: number): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('increment_article_views', { row_id: id });
  if (!error) return;

  const { data } = await supabase
    .from('articles')
    .select('views')
    .eq('id', id)
    .maybeSingle();
  await supabase
    .from('articles')
    .update({ views: (Number(data?.views) || 0) + 1 })
    .eq('id', id);
}

/** Ganti kolom utama dengan versi bahasa Inggris bila tersedia (mutasi baris). */
export function localizeArticle(row: ArticleRow, lang: Lang): ArticleRow {
  if (lang === 'en' && typeof row.title_en === 'string' && row.title_en) {
    row.title = row.title_en;
    if (typeof row.excerpt_en === 'string' && row.excerpt_en) row.excerpt = row.excerpt_en;
    if (typeof row.content_en === 'string' && row.content_en) row.content = row.content_en;
  }
  // Label kategori pada kartu artikel ikut dialihbahasakan (nama asli tetap utuh).
  if (lang === 'en' && typeof row.category_name_en === 'string' && row.category_name_en) {
    row.category_name = row.category_name_en;
  }
  return row;
}

/** Ganti nama kategori dengan versi bahasa Inggris bila tersedia (mutasi baris). */
export function localizeCategory(row: ArticleRow, lang: Lang): ArticleRow {
  if (lang === 'en' && typeof row.name_en === 'string' && row.name_en) {
    row.name = row.name_en;
  }
  return row;
}

export const parseLimit = (v: unknown, def = 12, max = 30): number => {
  const n = parseInt(String(v), 10);
  if (Number.isNaN(n) || n < 1) return def;
  return Math.min(n, max);
};

/** Ubah judul menjadi slug URL: "Berita Terbaru Hari Ini" → "berita-terbaru-hari-ini" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
