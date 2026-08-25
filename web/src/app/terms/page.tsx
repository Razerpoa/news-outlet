import type { Metadata } from 'next';
import type { Lang } from '@/lib/lang';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import { getSiteContacts, SITE_TERMS_UPDATED } from '@/lib/site-info';

export const dynamic = 'force-dynamic';

/** Format tanggal tetap (ISO) sesuai bahasa aktif — bukan tanggal berjalan. */
function formatUpdated(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, 'terms_title'),
    description: t(lang, 'terms_lead'),
  };
}

export default async function TermsPage() {
  const lang = await getLang();
  const { email } = getSiteContacts();

  const sections = [
    { title: t(lang, 'terms_s1_title'), body: t(lang, 'terms_s1_body') },
    { title: t(lang, 'terms_s2_title'), body: t(lang, 'terms_s2_body') },
    { title: t(lang, 'terms_s3_title'), body: t(lang, 'terms_s3_body') },
    { title: t(lang, 'terms_s4_title'), body: t(lang, 'terms_s4_body') },
    { title: t(lang, 'terms_s5_title'), body: t(lang, 'terms_s5_body') },
    { title: t(lang, 'terms_s6_title'), body: t(lang, 'terms_s6_body') },
    { title: t(lang, 'terms_s7_title'), body: t(lang, 'terms_s7_body') },
    { title: t(lang, 'terms_s8_title'), body: t(lang, 'terms_s8_body') },
  ];

  return (
    <div className="container">
      <article className="static-page">
        <h1>{t(lang, 'terms_title')}</h1>
        <p className="static-page-lead">{t(lang, 'terms_lead')}</p>
        <p className="static-page-updated">
          {t(lang, 'terms_updated')}: {formatUpdated(SITE_TERMS_UPDATED, lang)}
        </p>

        <ol className="static-page-sections">
          {sections.map((section) => (
            <li key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </li>
          ))}
        </ol>

        <p className="static-page-note">
          {email ? t(lang, 'terms_closing_email', { email }) : t(lang, 'terms_closing')}
        </p>
      </article>
    </div>
  );
}
