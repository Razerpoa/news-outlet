'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Category } from '@/lib/types';
import { t, type Lang } from '@/lib/lang';

export default function MobileMenu({
  categories,
  isLoggedIn,
  lang,
}: {
  categories: Category[];
  isLoggedIn: boolean;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="icon-btn mobile-menu-btn"
        onClick={() => setOpen(true)}
        aria-label={t(lang, 'open_menu')}
        title={t(lang, 'menu')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <div className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="mobile-menu-backdrop" onClick={close} />
        <div className="mobile-menu-panel" role="dialog" aria-label={t(lang, 'menu')}>
          <div className="mobile-menu-head">
            <h3>{t(lang, 'menu')}</h3>
            <button type="button" className="icon-btn" onClick={close} aria-label={t(lang, 'close_menu')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="mobile-menu-links">
            <Link href="/" onClick={close}>
              <span className="dot" style={{ ['--cat-color' as string]: 'var(--accent)' }} />
              {t(lang, 'nav_latest')}
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} onClick={close}>
                <span className="dot" style={{ ['--cat-color' as string]: c.color }} />
                {c.name}
              </Link>
            ))}
            {isLoggedIn ? (
              <Link href="/write" onClick={close}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {t(lang, 'write_news')}
              </Link>
            ) : (
              <Link href="/login" onClick={close}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                {t(lang, 'login_redaksi')}
              </Link>
            )}
            <Link href="/find" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              {t(lang, 'search_news')}
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
