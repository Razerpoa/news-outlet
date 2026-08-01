import Link from 'next/link';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';

export default async function NotFound() {
  const lang = await getLang();
  return (
    <div className="container">
      <div className="not-found">
        <h1>404</h1>
        <h2>{t(lang, 'not_found_title')}</h2>
        <p>{t(lang, 'not_found_desc')}</p>
        <Link href="/" className="btn">
          ← {t(lang, 'back_home')}
        </Link>
      </div>
    </div>
  );
}
