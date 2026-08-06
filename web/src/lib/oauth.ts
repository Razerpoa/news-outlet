import 'server-only';
import { request as httpsRequest } from 'node:https';

// Origin absolut situs — dipakai sebagai redirect_uri OAuth Google.
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

export const GOOGLE_REDIRECT_PATH = '/api/auth/google/callback';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_HOST = 'oauth2.googleapis.com';
const GOOGLE_TOKEN_PATH = '/token';
const GOOGLE_USERINFO_HOST = 'www.googleapis.com';
const GOOGLE_USERINFO_PATH = '/oauth2/v2/userinfo';

const REQUEST_TIMEOUT_MS = 15000;

/**
 * HTTP(S) ke host Google memakai modul `https` Node (bukan global fetch).
 * Alasan: global fetch (undici) gagal dengan ETIMEDOUT di lingkungan ini
 * walau koneksi TCP/TLS berjalan normal; `https.request` dengan `family: 4`
 * bekerja dengan andal (cek MTU jaringan Docker bila timeout tetap terjadi).
 */
function requestJson(
  host: string,
  path: string,
  method: 'GET' | 'POST',
  body?: string,
  headers: Record<string, string> = {}
): Promise<{ status: number; body: string } | null> {
  return new Promise((resolve) => {
    const req = httpsRequest(
      {
        host,
        path,
        method,
        family: 4,
        headers: {
          ...(body
            ? {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body),
              }
            : {}),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }));
      }
    );
    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error('ETIMEDOUT')));
    req.on('error', () => resolve(null));
    if (body) req.write(body);
    req.end();
  });
}

/** Redirect URI yang harus didaftarkan di Google Cloud Console. */
export function googleRedirectUri(): string {
  return `${APP_URL}${GOOGLE_REDIRECT_PATH}`;
}

/** URL otorisasi Google (langkah pertama alur OAuth). */
export function googleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export interface GoogleToken {
  access_token: string;
  id_token?: string;
}

/** Tukar authorization code dengan access token. */
export async function exchangeCodeForToken(code: string): Promise<GoogleToken | null> {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    redirect_uri: googleRedirectUri(),
    grant_type: 'authorization_code',
  }).toString();

  const res = await requestJson(GOOGLE_TOKEN_HOST, GOOGLE_TOKEN_PATH, 'POST', body);
  if (!res) {
    console.error('[OAuth] Pertukaran kode gagal (jaringan/timeout)');
    return null;
  }
  if (res.status !== 200) {
    console.error('[OAuth] Pertukaran kode gagal:', res.status, res.body);
    return null;
  }
  try {
    return JSON.parse(res.body) as GoogleToken;
  } catch {
    console.error('[OAuth] Respons token tidak valid:', res.body.slice(0, 200));
    return null;
  }
}

export interface GoogleProfile {
  email?: string;
  name?: string;
  picture?: string;
}

/** Ambil profil pengguna Google (email, nama, avatar). */
export async function fetchGoogleUser(accessToken: string): Promise<GoogleProfile | null> {
  const res = await requestJson(GOOGLE_USERINFO_HOST, GOOGLE_USERINFO_PATH, 'GET', undefined, {
    Authorization: `Bearer ${accessToken}`,
  });
  if (!res) {
    console.error('[OAuth] Ambil profil Google gagal (jaringan/timeout)');
    return null;
  }
  if (res.status !== 200) {
    console.error('[OAuth] Ambil profil Google gagal:', res.status, res.body);
    return null;
  }
  try {
    return JSON.parse(res.body) as GoogleProfile;
  } catch {
    console.error('[OAuth] Respons profil tidak valid:', res.body.slice(0, 200));
    return null;
  }
}
