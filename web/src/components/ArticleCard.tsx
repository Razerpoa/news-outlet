import Link from 'next/link';
import type { Article } from '@/lib/types';
import { formatViews, timeAgo } from '@/lib/utils';
import { t, type Lang } from '@/lib/lang';

interface Props {
  article: Article;
  variant?: 'default' | 'row';
  className?: string;
  lang?: Lang;
}

export default function ArticleCard({ article, variant = 'default', className = '', lang = 'id' }: Props) {
  if (variant === 'row') {
    return (
      <article className={`card-row ${className}`}>
        <Link href={`/article/${article.slug}`} className="card-media" tabIndex={-1} aria-hidden>
          <img src={article.image_url} alt="" loading="lazy" />
        </Link>
        <div className="card-body">
          <span
            className="badge"
            style={{ ['--cat-color' as string]: article.category_color }}
          >
            <span className="dot" />
            {article.category_name}
          </span>
          <Link href={`/article/${article.slug}`}>
            <h3 className="card-title" style={{ fontSize: '1rem' }}>
              {article.title}
            </h3>
          </Link>
          <div className="card-meta">
            <span>{article.author}</span>
            <span className="sep" />
            <span>{timeAgo(article.published_at, lang)}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`card ${className}`}>
      <Link href={`/article/${article.slug}`} className="card-media" tabIndex={-1} aria-hidden>
        <img src={article.image_url} alt="" loading="lazy" />
        <span
          className="badge"
          style={{ ['--cat-color' as string]: article.category_color }}
        >
          <span className="dot" />
          {article.category_name}
        </span>
      </Link>
      <div className="card-body">
        <Link href={`/article/${article.slug}`}>
          <h3 className="card-title">{article.title}</h3>
        </Link>
        <p className="card-excerpt">{article.excerpt}</p>
        <div className="card-meta">
          <span>{article.author}</span>
          <span className="sep" />
          <span>{timeAgo(article.published_at, lang)}</span>
          <span className="sep" />
          <span>{t(lang, 'read_count', { n: formatViews(article.views, lang) })}</span>
        </div>
      </div>
    </article>
  );
}
