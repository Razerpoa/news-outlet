import type { Metadata } from 'next';
import Link from 'next/link';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import { getEditorialTeam } from '@/lib/site-info';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, 'about_title'),
    description: t(lang, 'about_lead'),
  };
}

export default async function AboutPage() {
  const lang = await getLang();
  const team = getEditorialTeam();
  const teamRows = [
    { role: t(lang, 'about_role_editor_in_chief'), name: team.editorInChief },
    { role: t(lang, 'about_role_managing_editor'), name: team.managingEditor },
  ].filter((row) => row.name.length > 0);

  return (
    <div className="container">
      <article className="static-page">
        <h1>{t(lang, 'about_title')}</h1>
        <p className="static-page-lead">{t(lang, 'about_lead')}</p>

        <section>
          <h2>{t(lang, 'about_mission_title')}</h2>
          <p>{t(lang, 'about_mission_text')}</p>
        </section>

        <section>
          <h2>{t(lang, 'about_values_title')}</h2>
          <p>{t(lang, 'about_values_text')}</p>
        </section>

        {teamRows.length > 0 && (
          <section>
            <h2>{t(lang, 'about_team_title')}</h2>
            <p>{t(lang, 'about_team_lead')}</p>
            <dl className="static-page-rows">
              {teamRows.map((row) => (
                <div key={row.role} className="static-page-row">
                  <dt>{row.role}</dt>
                  <dd>{row.name}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section>
          <h2>{t(lang, 'about_contact_title')}</h2>
          <p>{t(lang, 'about_contact_cta')}</p>
          <Link className="btn" href="/contact">
            {t(lang, 'contact')}
          </Link>
        </section>
      </article>
    </div>
  );
}
