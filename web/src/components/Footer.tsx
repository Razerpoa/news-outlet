import Link from 'next/link';
import { api } from '@/lib/api';
import { getSessionUser } from '@/lib/auth';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import { getBrandParts } from '@/lib/brand';

export default async function Footer() {
  const lang = await getLang();
  const categories = (await api.categories(lang)) ?? [];
  const user = await getSessionUser();
  const brand = getBrandParts();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link href="/" className="footer-logo">
            <img src="/logo.svg" alt="" width={34} height={34} />
            <span className="brand-white">{brand.first}</span>
            {brand.rest ? <span className="brand-red">{brand.rest}</span> : null}
          </Link>
          <p className="footer-about">{t(lang, 'about_footer')}</p>
        </div>

        <div className="footer-col">
          <h4>{t(lang, 'categories')}</h4>
          <ul>
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t(lang, 'company')}</h4>
          <ul>
            <li><Link href="/about">{t(lang, 'about_us')}</Link></li>
            <li><Link href="/">{t(lang, 'editorial')}</Link></li>
            <li><Link href="/">{t(lang, 'media_guidelines')}</Link></li>
            <li><Link href="/">{t(lang, 'careers')}</Link></li>
            <li><Link href="/">{t(lang, 'advertise')}</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t(lang, 'services')}</h4>
          <ul>
            <li><Link href="/contact">{t(lang, 'contact')}</Link></li>
            <li>
              {user ? (
                <Link href="/write">{t(lang, 'write_news')}</Link>
              ) : (
                <Link href="/login">{t(lang, 'login_redaksi')}</Link>
              )}
            </li>
            <li><Link href="/">{t(lang, 'privacy')}</Link></li>
            <li><Link href="/find">{t(lang, 'search_link')}</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{t(lang, 'copyright')}</span>
      </div>
    </footer>
  );
}
