import type { Lang } from './lang';

export const ARTICLE_SELECT = `
  SELECT a.id, a.slug, a.title, a.title_en, a.excerpt, a.excerpt_en,
         a.content, a.content_en, a.author, a.image_url,
         a.published_at, a.views, a.featured, a.created_at,
         c.id   AS category_id,
         c.slug AS category_slug,
         c.name AS category_name,
         c.name_en AS category_name_en,
         c.color AS category_color
  FROM articles a
  JOIN categories c ON a.category_id = c.id
`;

type ArticleRow = Record<string, unknown>;

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
