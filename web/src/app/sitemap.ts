import type { MetadataRoute } from 'next';
import { getSupabase } from '@/lib/db';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

// ISR: sitemap di-refresh berkala di runtime agar artikel baru cepat terindeks.
// Catatan: saat `docker build` tidak ada DB yang bisa diakses, sehingga kueri
// di bawah dibungkus try/catch — build memakai fallback (beranda saja) dan
// versi lengkap dihasilkan otomatis saat runtime ketika DB tersedia.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'hourly', priority: 1 },
    // Halaman statis — di luar try/catch agar tetap masuk sitemap saat build tanpa DB.
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/terms`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/privacy`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const supabase = getSupabase();
    const [articlesRes, categoriesRes] = await Promise.all([
      supabase
        .from('articles')
        .select('slug, published_at, created_at')
        .order('published_at', { ascending: false }),
      supabase.from('categories').select('slug').order('id', { ascending: true }),
    ]);

    const articles = (articlesRes.data ?? []) as {
      slug: string;
      published_at: string;
      created_at: string;
    }[];
    const categories = (categoriesRes.data ?? []) as { slug: string }[];

    entries.push(
      ...categories.map((c) => ({
        url: `${siteUrl}/category/${c.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
      ...articles.map((a) => ({
        url: `${siteUrl}/article/${a.slug}`,
        lastModified: new Date(
          Math.max(Date.parse(a.published_at), Date.parse(a.created_at))
        ).toISOString(),
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
