'use client';

import { getClientLang, t } from '@/lib/lang';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const lang = getClientLang();
  return (
    <div className="container">
      <div className="not-found">
        <h1 style={{ fontSize: '3rem' }}>{t(lang, 'error_title')}</h1>
        <h2>{t(lang, 'error_subtitle')}</h2>
        <p>{error.message || t(lang, 'error_msg_default')}</p>
        <button type="button" className="btn" onClick={reset}>
          {t(lang, 'retry')}
        </button>
      </div>
    </div>
  );
}
