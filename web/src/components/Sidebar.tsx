import Link from 'next/link';
import type { Article, Category } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { t, type Lang } from '@/lib/lang';

export default async function Sidebar({
  trending,
  categories,
  lang = 'id',
}: {
  trending: Article[];
  categories: Category[];
  lang?: Lang;
}) {
  return (
    <aside className="sidebar">
      <div className="side-card">
        <h2 className="side-card-title">{t(lang, 'popular')}</h2>
        <ol className="trend-list">
          {trending.map((a, i) => (
            <li key={a.id} className="trend-item">
              <span className="trend-rank">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <Link href={`/artikel/${a.slug}`}>
                  <span className="trend-title">{a.title}</span>
                </Link>
                <div className="trend-meta">{timeAgo(a.published_at, lang)}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="side-card">
        <h2 className="side-card-title">{t(lang, 'categories')}</h2>
        <div className="chip-list">
          {categories.map((c) => (
            <Link key={c.id} href={`/kategori/${c.slug}`} className="chip">
              <span className="dot" style={{ ['--cat-color' as string]: c.color }} />
              {c.name}
            </Link>
          ))}
        </div>
      </div>

    </aside>
  );
}
