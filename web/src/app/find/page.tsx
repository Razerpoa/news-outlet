import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import ArticleCard from '@/components/ArticleCard';
import SearchBox from '@/components/SearchBox';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, 'search_title'),
    description: t(lang, 'meta_desc'),
  };
}

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const lang = await getLang();
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const results = q ? await api.search(q, lang) : null;
  const items = results?.items ?? [];

  return (
    <div className="container">
      <div className="search-page">
        <div className="search-box">
          <h1>{t(lang, 'search_title')}</h1>
          <SearchBox initial={q} lang={lang} />
          {q && (
            <p className="search-hint">
              {results ? (
                <>
                  {t(lang, 'search_hint_results', { n: items.length, q })}
                </>
              ) : (
                <>{t(lang, 'search_hint_query', { q })}</>
              )}
            </p>
          )}
        </div>

        {q && items.length > 0 && (
          <div className="search-results">
            {items.map((a) => (
              <ArticleCard key={a.id} article={a} variant="row" lang={lang} />
            ))}
          </div>
        )}

        {q && items.length === 0 && (
          <div className="empty-state">
            <h2>{t(lang, 'search_no_results', { q })}</h2>
            <p>{t(lang, 'search_no_results_desc')}</p>
          </div>
        )}

        {!q && (
          <div className="empty-state">
            <h2>{t(lang, 'search_empty_title')}</h2>
            <p>{t(lang, 'search_empty_desc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
