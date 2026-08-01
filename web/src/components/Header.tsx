import Link from 'next/link';
import { api } from '@/lib/api';
import { getSessionUser } from '@/lib/auth';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import { getBrandParts, SITE_BRAND_NAME } from '@/lib/brand';
import { todayLong } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import LogoutButton from './LogoutButton';
import LangToggle from './LangToggle';

export default async function Header({ activeSlug }: { activeSlug?: string }) {
  const lang = await getLang();
  const categories = (await api.categories(lang)) ?? [];
  // Tombol "Tulis Berita" hanya tampil untuk redaksi yang sudah masuk.
  const user = await getSessionUser();
  const brand = getBrandParts();

  return (
    <header className="site-header">
      <div className="header-main">
        <Link href="/" className="site-logo" aria-label={`${SITE_BRAND_NAME} — ${t(lang, 'home')}`}>
          <img src="/logo.svg" alt="" width={38} height={38} />
          <span>
            <span className="brand-white">{brand.first}</span>
            {brand.rest ? <span className="brand-red">{brand.rest}</span> : null}
          </span>
        </Link>

        <span className="header-date">{todayLong(lang)}</span>

        <div className="header-actions">
          {user ? (
            <>
              <Link href="/tulis" className="write-btn" title={t(lang, 'write_news')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {t(lang, 'write_news')}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/masuk" className="write-btn write-btn-ghost" title={t(lang, 'login_redaksi')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              {t(lang, 'login')}
            </Link>
          )}
          <LangToggle lang={lang} />
          <Link href="/cari" className="icon-btn" aria-label={t(lang, 'search_link_aria')} title={t(lang, 'search_news')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          <ThemeToggle lang={lang} />
          <MobileMenu categories={categories} isLoggedIn={!!user} lang={lang} />
        </div>
      </div>

      <nav className="nav" aria-label={t(lang, 'nav_main')}>
        <div className="nav-inner">
          <Link href="/" className={`nav-link ${activeSlug === 'terbaru' ? 'active' : ''}`}>
            {t(lang, 'nav_latest')}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/kategori/${c.slug}`}
              className={`nav-link ${activeSlug === c.slug ? 'active' : ''}`}
            >
              <span className="dot" style={{ ['--cat-color' as string]: c.color }} />
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
