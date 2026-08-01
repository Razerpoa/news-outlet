import Link from 'next/link';
import { api } from '@/lib/api';
import { getSessionUser } from '@/lib/auth';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';

export default async function Footer() {
  const lang = await getLang();
  const categories = (await api.categories(lang)) ?? [];
  const user = await getSessionUser();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link href="/" className="footer-logo">
            <img src="/logo.svg" alt="" width={34} height={34} />
            Kabar<em>Nusantara</em>
          </Link>
          <p className="footer-about">{t(lang, 'about_footer')}</p>
        </div>

        <div className="footer-col">
          <h4>{t(lang, 'categories')}</h4>
          <ul>
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/kategori/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t(lang, 'company')}</h4>
          <ul>
            <li><Link href="/">{t(lang, 'about_us')}</Link></li>
            <li><Link href="/">{t(lang, 'editorial')}</Link></li>
            <li><Link href="/">{t(lang, 'media_guidelines')}</Link></li>
            <li><Link href="/">{t(lang, 'careers')}</Link></li>
            <li><Link href="/">{t(lang, 'advertise')}</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t(lang, 'services')}</h4>
          <ul>
            <li><Link href="/">{t(lang, 'contact')}</Link></li>
            <li>
              {user ? (
                <Link href="/tulis">{t(lang, 'write_news')}</Link>
              ) : (
                <Link href="/masuk">{t(lang, 'login_redaksi')}</Link>
              )}
            </li>
            <li><Link href="/">{t(lang, 'privacy')}</Link></li>
            <li><Link href="/cari">{t(lang, 'search_link')}</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{t(lang, 'copyright')}</span>
      </div>
    </footer>
  );
}
