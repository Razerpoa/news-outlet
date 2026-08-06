import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import ArticleCard from '@/components/ArticleCard';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PER_PAGE = 10;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const categories = await api.categories(lang);
  const cat = categories?.find((c) => c.slug === slug);
  return {
    title: cat ? t(lang, 'category_news', { name: cat.name }) : t(lang, 'categories'),
    description: cat ? t(lang, 'cat_desc', { name: cat.name }) : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const lang = await getLang();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const offset = (page - 1) * PER_PAGE;

  const [categories, list] = await Promise.all([
    api.categories(lang),
    slug === 'terbaru'
      ? api.latest(undefined, PER_PAGE, offset, lang)
      : api.categoryArticles(slug, PER_PAGE, offset, lang),
  ]);

  const cat = categories?.find((c) => c.slug === slug);
  if (slug !== 'terbaru' && !cat) notFound();

  const items = list?.items ?? [];
  const total = list?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const catColor = cat?.color ?? 'var(--accent)';

  return (
    <div className="container">
      <section className="cat-hero">
        <h1 style={{ ['--cat-color' as string]: catColor }}>
          {slug === 'terbaru' ? t(lang, 'all_latest') : t(lang, 'category_news', { name: cat?.name ?? '' })}
        </h1>
        <p>
          {slug === 'terbaru' ? t(lang, 'cat_desc_all') : t(lang, 'cat_desc', { name: cat?.name ?? '' })}
        </p>
      </section>

      {items.length > 0 ? (
        <>
          <div className="cat-list">
            {items.map((a) => (
              <ArticleCard key={a.id} article={a} variant="row" lang={lang} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="pagination" aria-label={t(lang, 'page_nav')}>
              <Link
                href={`/category/${slug}?page=${page - 1}`}
                className={`page-btn ${page <= 1 ? 'disabled-link' : ''}`}
                aria-disabled={page <= 1}
                style={page <= 1 ? { pointerEvents: 'none' } : undefined}
                tabIndex={page <= 1 ? -1 : 0}
              >
                {t(lang, 'prev')}
              </Link>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <span key={p} style={{ display: 'contents' }}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="page-btn">…</span>}
                    <Link
                      href={`/category/${slug}?page=${p}`}
                      className={`page-btn ${p === page ? 'active' : ''}`}
                      aria-current={p === page ? 'page' : undefined}
                    >
                      {p}
                    </Link>
                  </span>
                ))}
              <Link
                href={`/category/${slug}?page=${page + 1}`}
                className={`page-btn ${page >= totalPages ? 'disabled-link' : ''}`}
                aria-disabled={page >= totalPages}
                style={page >= totalPages ? { pointerEvents: 'none' } : undefined}
                tabIndex={page >= totalPages ? -1 : 0}
              >
                {t(lang, 'next')}
              </Link>
            </nav>
          )}
        </>
      ) : (
        <div className="empty-state" style={{ marginTop: 24 }}>
          <h2>{t(lang, 'empty_no_news')}</h2>
          <p>{t(lang, 'try_again_later')}</p>
        </div>
      )}
    </div>
  );
}
