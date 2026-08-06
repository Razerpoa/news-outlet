import { NextRequest, NextResponse } from 'next/server';
import {
  authorizeGoogleUser,
  consumeOAuthState,
  createSession,
  setSessionCookie,
} from '@/lib/auth';
import { exchangeCodeForToken, fetchGoogleUser, APP_URL } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

const badRedirect = (error: string) => `${APP_URL}/login?error=${error}`;

/** Callback OAuth Google: verifikasi state, tukar code, dan buat sesi. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const expectedState = await consumeOAuthState();

    // State tidak cocok/kedaluwarsa → kemungkinan serangan CSRF; tolak.
    if (!code || !state || !expectedState || state !== expectedState) {
      return NextResponse.redirect(badRedirect('invalid_state'));
    }

    const token = await exchangeCodeForToken(code);
    if (!token) {
      return NextResponse.redirect(badRedirect('oauth_failed'));
    }

    const profile = await fetchGoogleUser(token.access_token);
    const email = profile?.email?.toLowerCase();
    if (!profile || !email) {
      return NextResponse.redirect(badRedirect('oauth_failed'));
    }

    const user = await authorizeGoogleUser(email, profile.name ?? null, profile.picture ?? null);
    if (!user) {
      return NextResponse.redirect(badRedirect('unauthorized'));
    }

    const sessionToken = await createSession(user.id);
    await setSessionCookie(sessionToken);
    return NextResponse.redirect(`${APP_URL}/write`);
  } catch (err) {
    console.error('[API ERROR]', err);
    return NextResponse.redirect(badRedirect('oauth_failed'));
  }
}
