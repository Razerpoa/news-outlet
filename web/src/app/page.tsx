import Link from 'next/link';
import { api } from '@/lib/api';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import { SITE_BRAND_NAME } from '@/lib/brand';
import { formatViews, timeAgo } from '@/lib/utils';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const lang = await getLang();
  const [headlines, latestRes, trending, categories] = await Promise.all([
    api.headlines(5, lang),
    api.latest(undefined, 8, 0, lang),
    api.trending(6, lang),
    api.categories(lang),
  ]);

  const latest = latestRes?.items ?? [];
  const cats = categories ?? [];
  const [hero, ...side] = headlines ?? [];
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_BRAND_NAME,
    url: siteUrl,
    description: t(lang, 'meta_desc'),
    publisher: {
      '@type': 'Organization',
      name: SITE_BRAND_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.svg`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      {/* ====================== Hero ====================== */}
      {hero && (
        <section className="hero">
          <div className="container">
            <div className="hero-grid">
              <Link href={`/article/${hero.slug}`} className="hero-feature">
                <img src={hero.image_url} alt="" />
                <div className="hero-feature-body">
                  <span className="badge" style={{ ['--cat-color' as string]: hero.category_color }}>
                    <span className="dot" />
                    {hero.category_name}
                  </span>
                  <h1 className="hero-feature-title">{hero.title}</h1>
                  <p className="hero-feature-excerpt">{hero.excerpt}</p>
                  <div className="hero-feature-meta">
                    <span>{hero.author}</span>
                    <span>•</span>
                    <span>{timeAgo(hero.published_at, lang)}</span>
                    <span>•</span>
                    <span>{t(lang, 'read_count', { n: formatViews(hero.views, lang) })}</span>
                  </div>
                </div>
              </Link>

              <div className="hero-side">
                {side.map((a) => (
                  <Link key={a.id} href={`/article/${a.slug}`} className="hero-side-item">
                    <img src={a.image_url} alt="" loading="lazy" />
                    <div className="hero-side-body">
                      <span
                        className="badge"
                        style={{ ['--cat-color' as string]: a.category_color }}
                      >
                        <span className="dot" />
                        {a.category_name}
                      </span>
                      <h2 className="hero-side-title">{a.title}</h2>
                      <div className="hero-side-meta">{timeAgo(a.published_at, lang)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====================== Terbaru + Sidebar ====================== */}
      <div className="container">
        <div className="layout-main">
          <section>
            <div className="section">
              <div className="section-head">
                <h2 className="section-title">{t(lang, 'news_latest')}</h2>
                <Link href="/category/terbaru" className="section-link">
                  {t(lang, 'view_all')} →
                </Link>
              </div>
              {latest.length > 0 ? (
                <div className="news-grid">
                  {latest.map((a) => (
                    <ArticleCard key={a.id} article={a} lang={lang} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h2>{t(lang, 'empty_no_news')}</h2>
                  <p>{t(lang, 'empty_reload')}</p>
                </div>
              )}
            </div>
          </section>

          <Sidebar trending={trending ?? []} categories={cats} lang={lang} />
        </div>
      </div>

      {/* ====================== Pilihan Kategori ====================== */}
      {cats.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">{t(lang, 'category_picks')}</h2>
            </div>
            {(
              await Promise.all(
                cats.slice(0, 3).map(async (c) => {
                  const res = await api.categoryArticles(c.slug, 3, 0, lang);
                  return { cat: c, items: res?.items ?? [] };
                })
              )
            ).map(({ cat, items }) =>
              items.length > 0 ? (
                <div key={cat.id} className="section" style={{ paddingTop: 0 }}>
                  <div className="section-head">
                    <h2 className="section-title" style={{ ['--cat-color' as string]: cat.color }}>
                      {cat.name}
                    </h2>
                    <Link href={`/category/${cat.slug}`} className="section-link">
                      {t(lang, 'read_more')} →
                    </Link>
                  </div>
                  <div className="news-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {items.map((a) => (
                      <ArticleCard key={a.id} article={a} lang={lang} />
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </section>
      )}
    </>
  );
}
