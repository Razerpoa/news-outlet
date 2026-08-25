import type { Metadata } from 'next';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import { getSiteContacts } from '@/lib/site-info';

export const dynamic = 'force-dynamic';

interface Channel {
  label: string;
  value: string;
  href: string | null;
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, 'contact_title'),
    description: t(lang, 'contact_lead'),
  };
}

export default async function ContactPage() {
  const lang = await getLang();
  const contacts = getSiteContacts();

  const channels: Channel[] = [];
  if (contacts.email) {
    channels.push({
      label: t(lang, 'contact_email_general_label'),
      value: contacts.email,
      href: `mailto:${contacts.email}`,
    });
  }
  if (contacts.emailEditorial) {
    channels.push({
      label: t(lang, 'contact_email_editorial_label'),
      value: contacts.emailEditorial,
      href: `mailto:${contacts.emailEditorial}`,
    });
  }
  if (contacts.emailAds) {
    channels.push({
      label: t(lang, 'contact_email_ads_label'),
      value: contacts.emailAds,
      href: `mailto:${contacts.emailAds}`,
    });
  }
  if (contacts.phone) {
    channels.push({
      label: t(lang, 'contact_phone_label'),
      value: contacts.phone,
      href: telHref(contacts.phone),
    });
  }
  if (contacts.address) {
    channels.push({
      label: t(lang, 'contact_address_label'),
      value: contacts.address,
      href: null,
    });
  }

  return (
    <div className="container">
      <article className="static-page">
        <h1>{t(lang, 'contact_title')}</h1>
        <p className="static-page-lead">{t(lang, 'contact_lead')}</p>

        {channels.length > 0 ? (
          <dl className="static-page-rows">
            {channels.map((channel) => (
              <div key={channel.label} className="static-page-row">
                <dt>{channel.label}</dt>
                <dd>
                  {channel.href ? (
                    <a href={channel.href}>{channel.value}</a>
                  ) : (
                    channel.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="static-page-note">{t(lang, 'contact_none_configured')}</p>
        )}
      </article>
    </div>
  );
}
