import { NextResponse } from 'next/server';
import { createOAuthState, setOAuthStateCookie } from '@/lib/auth';
import { googleAuthUrl, SITE_URL } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

/** Mulai alur login Google: arahkan browser ke halaman otorisasi Google. */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${SITE_URL}/login?error=missing_config`);
  }

  const state = createOAuthState();
  await setOAuthStateCookie(state);

  return NextResponse.redirect(googleAuthUrl(state));
}
