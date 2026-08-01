import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLang } from '@/lib/lang-server';
import { t } from '@/lib/lang';
import { getSessionUser } from '@/lib/auth';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, 'login_title'),
    description: t(lang, 'login_lead'),
  };
}

const LOGIN_ERRORS = ['unauthorized', 'invalid_state', 'oauth_failed', 'missing_config'] as const;
type LoginError = (typeof LOGIN_ERRORS)[number];

function loginErrorKey(value: string | undefined): LoginError | null {
  return LOGIN_ERRORS.includes(value as LoginError) ? (value as LoginError) : null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const lang = await getLang();
  const user = await getSessionUser();
  if (user) redirect('/tulis');

  const { error } = await searchParams;
  const errorKey = loginErrorKey(error);

  return (
    <div className="login-page">
      <div className="login-inner">
        <h1>{t(lang, 'login_title')}</h1>
        <p className="write-lead">{t(lang, 'login_lead')}</p>

        <div className="form-card login-card">
          {errorKey && (
            <div className="form-alert error" role="alert">
              {t(lang, `login_error_${errorKey}`)}
            </div>
          )}
          <p className="login-google-note">{t(lang, 'login_google_desc')}</p>
          <div className="login-actions">
            <GoogleLoginButton lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
