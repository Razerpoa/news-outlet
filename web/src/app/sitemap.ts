import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

// ISR: sitemap di-refresh berkala di runtime agar artikel baru cepat terindeks.
// Catatan: saat `docker build` tidak ada DB yang bisa diakses, sehingga kueri
// di bawah dibungkus try/catch — build memakai fallback (beranda saja) dan
// versi lengkap dihasilkan otomatis saat runtime ketika DB tersedia.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'hourly', priority: 1 },
  ];

  try {
    const [articlesRes, categoriesRes] = await Promise.all([
      query(
        `SELECT slug, GREATEST(published_at, created_at) AS updated
           FROM articles
          ORDER BY published_at DESC`
      ),
      query(`SELECT slug FROM categories ORDER BY id`),
    ]);

    const articles = articlesRes.rows as { slug: string; updated: string }[];
    const categories = categoriesRes.rows as { slug: string }[];

    entries.push(
      ...categories.map((c) => ({
        url: `${siteUrl}/category/${c.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
      ...articles.map((a) => ({
        url: `${siteUrl}/article/${a.slug}`,
        lastModified: a.updated,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    );
  } catch (err) {
    // Build tanpa DB (mis. docker build): jangan gagalkan build — sitemap
    // lengkap dibuat saat runtime via ISR revalidate.
    console.error('[sitemap] DB tidak tersedia saat generate:', err);
  }

  return entries;
}
