import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SITE_BRAND_NAME } from '@/lib/brand';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import { formatDateTime, formatViews, readingTime } from '@/lib/utils';
import ArticleCard from '@/components/ArticleCard';
import ShareButtons from '@/components/ShareButtons';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const article = await api.article(slug, lang);
  if (!article) return { title: t(lang, 'not_found_meta') };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.image_url }],
      type: 'article',
      locale: lang === 'en' ? 'en_US' : 'id_ID',
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const lang = await getLang();
  const [article, related] = await Promise.all([
    api.article(slug, lang),
    api.related(slug, lang),
  ]);

  if (!article) notFound();

  const paragraphs = article.content.split('\n\n');
  const minutes = readingTime(article.content);
  const authorInitial = article.author.trim().charAt(0).toUpperCase();
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.image_url,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_BRAND_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.svg`,
      },
    },
    datePublished: article.published_at,
    dateModified: article.published_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/article/${article.slug}`,
    },
    keywords: [article.category_name, article.category_slug],
  };

  return (
    <div className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="article-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">{t(lang, 'home')}</Link>
          <span className="sep">/</span>
          <Link href={`/category/${article.category_slug}`}>{article.category_name}</Link>
          <span className="sep">/</span>
          <span aria-current="page">{article.title.slice(0, 60)}…</span>
        </nav>

        {/* Judul & metadata */}
        <header className="article-head">
          <span
            className="article-cat"
            style={{ ['--article-cat' as string]: article.category_color }}
          >
            <span className="dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
            {article.category_name}
          </span>
          <h1 className="article-title">{article.title}</h1>
          <p className="article-lead">{article.excerpt}</p>

          <div className="article-meta">
            <span className="author-avatar">{authorInitial}</span>
            <div className="meta-info">
              <span className="meta-author">{article.author}</span>
              <span className="meta-sub">
                <time dateTime={article.published_at}>{formatDateTime(article.published_at, lang)}</time>
                <span>•</span>
                <span>{t(lang, 'minutes_read', { n: minutes })}</span>
                <span>•</span>
                <span>{t(lang, 'read_count', { n: formatViews(article.views, lang) })}</span>
              </span>
            </div>
            <span className="meta-spacer" />
          </div>

          <ShareButtons title={article.title} lang={lang} />
        </header>

        {/* Gambar utama */}
        <figure className="article-hero">
          <img src={article.image_url} alt={article.title} />
        </figure>
        <figcaption className="article-caption">
          {t(lang, 'illustration', { title: article.title })}
        </figcaption>

        {/* Isi artikel */}
        <div className="article-body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="article-tags">
          <span className="chip">#{article.category_slug}</span>
          <span className="chip">#berita-terkini</span>
          <span className="chip">#kabar-nusantara</span>
        </div>

        <ShareButtons title={article.title} lang={lang} />
      </article>

      {/* Artikel terkait */}
      {related && related.length > 0 && (
        <section className="section" style={{ paddingTop: 8 }}>
          <div className="section-head">
            <h2 className="section-title">{t(lang, 'related_news')}</h2>
          </div>
          <div className="news-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
