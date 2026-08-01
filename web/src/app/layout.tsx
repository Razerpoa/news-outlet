import type { Metadata, Viewport } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import { SITE_BRAND_NAME } from '@/lib/brand';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const title = `${SITE_BRAND_NAME} — ${t(lang, 'tagline')}`;
  return {
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: siteUrl,
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
    title: {
      default: title,
      template: `%s | ${SITE_BRAND_NAME}`,
    },
    description: t(lang, 'meta_desc'),
    keywords: t(lang, 'meta_keys'),
    openGraph: {
      type: 'website',
      siteName: SITE_BRAND_NAME,
      locale: lang === 'en' ? 'en_US' : 'id_ID',
      title,
      url: siteUrl,
      description: t(lang, 'og_desc'),
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#b3261e',
};

// Pastikan pengunjung baru langsung memakai bahasa Indonesia.
const langScript = `
(function () {
  try {
    var hasLangCookie = document.cookie.split(';').some(function (part) {
      return part.trim().indexOf('kn_lang=') === 0;
    });
    if (!hasLangCookie) {
      document.cookie = 'kn_lang=id; path=/; max-age=31536000; samesite=lax';
    }
  } catch (e) {}
})();
`;

// Terapkan tema tersimpan sebelum render untuk mencegah kedipan (FOUC)
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('kn-theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
