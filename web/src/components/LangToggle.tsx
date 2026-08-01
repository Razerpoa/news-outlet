'use client';

import { useRouter } from 'next/navigation';
import { LANGS, setLangCookie, t, type Lang } from '@/lib/lang';

/**
 * Tombol pengalih bahasa ID/EN di navbar. Menulis cookie `kn_lang`
 * lalu me-refresh komponen server agar seluruh halaman ikut berganti bahasa.
 */
export default function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();
  const next: Lang = lang === 'id' ? 'en' : 'id';

  const switchLang = () => {
    setLangCookie(next);
    router.refresh();
  };

  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={switchLang}
      aria-label={t(lang, 'lang_to_en')}
      title={t(lang, 'lang_to_en')}
    >
      {LANGS.map((l) => (
        <span key={l} className={l === lang ? 'active' : ''} aria-current={l === lang}>
          {l.toUpperCase()}
        </span>
      ))}
    </button>
  );
}
