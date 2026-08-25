import type { Metadata } from 'next';
import type { Lang } from '@/lib/lang';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import { getSiteContacts, SITE_PRIVACY_UPDATED } from '@/lib/site-info';

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
    title: t(lang, 'privacy_title'),
    description: t(lang, 'privacy_lead'),
  };
}

export default async function PrivacyPage() {
  const lang = await getLang();
  const { email } = getSiteContacts();

  const sections = [
    { title: t(lang, 'privacy_s1_title'), body: t(lang, 'privacy_s1_body') },
    { title: t(lang, 'privacy_s2_title'), body: t(lang, 'privacy_s2_body') },
    { title: t(lang, 'privacy_s3_title'), body: t(lang, 'privacy_s3_body') },
    { title: t(lang, 'privacy_s4_title'), body: t(lang, 'privacy_s4_body') },
    { title: t(lang, 'privacy_s5_title'), body: t(lang, 'privacy_s5_body') },
    { title: t(lang, 'privacy_s6_title'), body: t(lang, 'privacy_s6_body') },
    { title: t(lang, 'privacy_s7_title'), body: t(lang, 'privacy_s7_body') },
    { title: t(lang, 'privacy_s8_title'), body: t(lang, 'privacy_s8_body') },
  ];

  return (
    <div className="container">
      <article className="static-page">
        <h1>{t(lang, 'privacy_title')}</h1>
        <p className="static-page-lead">{t(lang, 'privacy_lead')}</p>
        <p className="static-page-updated">
          {t(lang, 'privacy_updated')}: {formatUpdated(SITE_PRIVACY_UPDATED, lang)}
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
          {email ? t(lang, 'privacy_closing_email', { email }) : t(lang, 'privacy_closing')}
        </p>
      </article>
    </div>
  );
}
